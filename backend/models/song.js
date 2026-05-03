import { openDb } from '../database/init.js';

export const SongModel = {
    async getAll() {
        const db = await openDb();
        return db.all('SELECT * FROM songs ORDER BY created_at DESC');
    },

    async getById(id) {
        const db = await openDb();
        return db.get('SELECT * FROM songs WHERE id = ?', id);
    },

    async create(song) {
        const db = await openDb();
        const { id, title, artist, url, cover_url, file_name } = song;
        await db.run(
            'INSERT INTO songs (id, title, artist, url, cover_url, file_name) VALUES (?, ?, ?, ?, ?, ?)',
            id, title, artist, url || null, cover_url || null, file_name || null
        );
        return song;
    },

    async update(id, data) {
        const db = await openDb();
        const { title, artist, url, cover_url, file_name } = data;
        await db.run(
            'UPDATE songs SET title = ?, artist = ?, url = ?, cover_url = ?, file_name = ? WHERE id = ?',
            title, artist, url || null, cover_url || null, file_name || null, id
        );
        return this.getById(id);
    },

    async delete(id) {
        const db = await openDb();
        await db.run('DELETE FROM songs WHERE id = ?', id);
    },

    async getUserSongs(userId = 'default') {
        const db = await openDb();
        return db.all(`
      SELECT s.*, us.is_liked, us.id as user_song_id, sc.category_id
      FROM songs s
      JOIN user_songs us ON s.id = us.song_id
      LEFT JOIN song_categories sc ON s.id = sc.song_id
      WHERE us.user_id = ?
      ORDER BY us.added_at DESC
    `, userId);
    },

    async addToUserPlaylist(songId, userId = 'default') {
        const db = await openDb();
        const exists = await db.get(
            'SELECT * FROM user_songs WHERE song_id = ? AND user_id = ?',
            songId, userId
        );

        if (!exists) {
            const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
            await db.run(
                'INSERT INTO user_songs (id, song_id, user_id) VALUES (?, ?, ?)',
                id, songId, userId
            );
        }
    },

    async removeFromUserPlaylist(songId, userId = 'default') {
        const db = await openDb();
        await db.run('DELETE FROM user_songs WHERE song_id = ? AND user_id = ?', songId, userId);
    },

    async toggleLike(songId, userId = 'default') {
        const db = await openDb();
        const userSong = await db.get(
            'SELECT is_liked FROM user_songs WHERE song_id = ? AND user_id = ?',
            songId, userId
        );

        if (userSong) {
            const newLikeStatus = userSong.is_liked ? 0 : 1;
            await db.run(
                'UPDATE user_songs SET is_liked = ? WHERE song_id = ? AND user_id = ?',
                newLikeStatus, songId, userId
            );
            return { liked: newLikeStatus === 1 };
        }
        return { liked: false };
    },

    async recordPlay(songId, userId = 'default') {
        const db = await openDb();
        await db.run(
            'INSERT INTO play_history (song_id, user_id) VALUES (?, ?)',
            songId, userId
        );
    },

    async getMostPlayed(limit = 10, userId = 'default') {
        const db = await openDb();
        return db.all(`
      SELECT s.*, COUNT(ph.id) as play_count, us.is_liked
      FROM songs s
      LEFT JOIN play_history ph ON s.id = ph.song_id AND ph.user_id = ?
      LEFT JOIN user_songs us ON s.id = us.song_id AND us.user_id = ?
      GROUP BY s.id
      ORDER BY play_count DESC
      LIMIT ?
    `, userId, userId, limit);
    }
};