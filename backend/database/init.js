import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function openDb() {
    return open({
        filename: path.join(__dirname, 'kazunote.db'),
        driver: sqlite3.Database
    });
}

export async function initDatabase() {
    const db = await openDb();

    // Create tables
    await db.exec(`
    -- Songs table
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      url TEXT,
      cover_url TEXT,
      file_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Lyrics table
    CREATE TABLE IF NOT EXISTS lyrics (
      song_id TEXT PRIMARY KEY,
      lyrics TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
    
    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Song-Category relation table
    CREATE TABLE IF NOT EXISTS song_categories (
      song_id TEXT,
      category_id TEXT,
      PRIMARY KEY (song_id, category_id),
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
    
    -- User playlist table
    CREATE TABLE IF NOT EXISTS user_songs (
      id TEXT PRIMARY KEY,
      song_id TEXT,
      user_id TEXT DEFAULT 'default',
      is_liked INTEGER DEFAULT 0,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
    
    -- Play history table
    CREATE TABLE IF NOT EXISTS play_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      song_id TEXT,
      user_id TEXT DEFAULT 'default',
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
  `);

    // Insert sample categories if empty
    const categories = await db.all('SELECT COUNT(*) as count FROM categories');
    if (categories[0].count === 0) {
        await db.exec(`
      INSERT INTO categories (id, name) VALUES 
        ('cat-pop', 'Pop'),
        ('cat-rock', 'Rock'),
        ('cat-jazz', 'Jazz'),
        ('classic', 'Klasik')
    `);
    }

    // Insert sample songs if empty
    const songs = await db.all('SELECT COUNT(*) as count FROM songs');
    if (songs[0].count === 0) {
        const sampleSongs = [
            {
                id: 'song1',
                title: 'Blinding Lights',
                artist: 'The Weeknd',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                cover_url: 'https://images.unsplash.com/photo-1590796583326-afd3bb20d22d'
            },
            {
                id: 'song2',
                title: 'Shape of You',
                artist: 'Ed Sheeran',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                cover_url: 'https://images.unsplash.com/photo-1590796583326-afd3bb20d22d'
            },
            {
                id: 'song3',
                title: 'Dance Monkey',
                artist: 'Tones and I',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                cover_url: 'https://images.unsplash.com/photo-1590796583326-afd3bb20d22d'
            }
        ];

        for (const song of sampleSongs) {
            await db.run(
                'INSERT INTO songs (id, title, artist, url, cover_url) VALUES (?, ?, ?, ?, ?)',
                song.id, song.title, song.artist, song.url, song.cover_url
            );
        }
    }

    console.log('✅ Database initialized successfully');
    return db;
}