import { openDb } from '../database/init.js';

const DEFAULT_LYRICS = [
    { time: 0, text: "Selamat datang di music player" },
    { time: 3, text: "Dengan lirik yang tersinkronisasi" },
    { time: 6, text: "Malam ini ku bermimpi" },
    { time: 9, text: "Tentang cinta yang abadi" },
    { time: 12, text: "Bintang bersinar terang" },
    { time: 15, text: "Menerangi hidupku" },
    { time: 18, text: "Kau dan aku selamanya" },
    { time: 21, text: "Takkan terpisahkan" },
    { time: 24, text: "Oh, indahnya cinta ini" },
    { time: 27, text: "Terima kasih telah mendengarkan 🎵" }
];

export const LyricsModel = {
    async getBySongId(songId) {
        const db = await openDb();
        const result = await db.get('SELECT lyrics FROM lyrics WHERE song_id = ?', songId);
        if (result && result.lyrics) {
            return JSON.parse(result.lyrics);
        }
        return DEFAULT_LYRICS;
    },

    async save(songId, lyrics) {
        const db = await openDb();
        const lyricsJson = JSON.stringify(lyrics);
        await db.run(
            `INSERT INTO lyrics (song_id, lyrics, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(song_id) DO UPDATE SET 
       lyrics = excluded.lyrics, 
       updated_at = CURRENT_TIMESTAMP`,
            songId, lyricsJson
        );
    },

    async delete(songId) {
        const db = await openDb();
        await db.run('DELETE FROM lyrics WHERE song_id = ?', songId);
    }
};