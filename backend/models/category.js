import { openDb } from '../database/init.js';

export const CategoryModel = {
    async getAll() {
        const db = await openDb();
        return db.all('SELECT * FROM categories ORDER BY created_at DESC');
    },

    async create(id, name) {
        const db = await openDb();
        await db.run('INSERT INTO categories (id, name) VALUES (?, ?)', id, name);
        return { id, name };
    },

    async delete(id) {
        const db = await openDb();
        await db.run('DELETE FROM categories WHERE id = ?', id);
    },

    async getSongsByCategory(categoryId) {
        const db = await openDb();
        return db.all(`
      SELECT s.* FROM songs s
      JOIN song_categories sc ON s.id = sc.song_id
      WHERE sc.category_id = ?
    `, categoryId);
    },

    async addSongToCategory(songId, categoryId) {
        const db = await openDb();
        await db.run(
            'INSERT OR IGNORE INTO song_categories (song_id, category_id) VALUES (?, ?)',
            songId, categoryId
        );
    },

    async removeSongFromCategory(songId, categoryId) {
        const db = await openDb();
        await db.run(
            'DELETE FROM song_categories WHERE song_id = ? AND category_id = ?',
            songId, categoryId
        );
    },

    async removeSongFromAllCategories(songId) {
        const db = await openDb();
        await db.run('DELETE FROM song_categories WHERE song_id = ?', songId);
    }
};