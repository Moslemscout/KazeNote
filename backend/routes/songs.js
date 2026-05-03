import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SongModel } from '../models/song.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// GET all songs
router.get('/', async (req, res) => {
    try {
        const songs = await SongModel.getAll();
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user playlist
router.get('/user-playlist', async (req, res) => {
    try {
        const songs = await SongModel.getUserSongs();
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET most played songs
router.get('/most-played', async (req, res) => {
    try {
        const songs = await SongModel.getMostPlayed(10);
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create song (with file upload)
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { title, artist, url } = req.body;
        const id = uuidv4();
        let fileUrl = url;
        let coverUrl = null;

        if (req.file) {
            const filePath = `/uploads/${req.file.filename}`;
            if (req.file.mimetype.startsWith('audio/')) {
                fileUrl = filePath;
            } else if (req.file.mimetype.startsWith('image/')) {
                coverUrl = filePath;
            }
        }

        const song = await SongModel.create({
            id,
            title,
            artist,
            url: fileUrl,
            cover_url: coverUrl || 'https://images.unsplash.com/photo-1590796583326-afd3bb20d22d',
            file_name: req.file?.filename
        });

        res.json(song);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST add to user playlist
router.post('/:id/add-to-playlist', async (req, res) => {
    try {
        await SongModel.addToUserPlaylist(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE remove from user playlist
router.delete('/:id/remove-from-playlist', async (req, res) => {
    try {
        await SongModel.removeFromUserPlaylist(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST toggle like
router.post('/:id/toggle-like', async (req, res) => {
    try {
        const result = await SongModel.toggleLike(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST record play
router.post('/:id/play', async (req, res) => {
    try {
        await SongModel.recordPlay(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update song
router.put('/:id', async (req, res) => {
    try {
        const song = await SongModel.update(req.params.id, req.body);
        res.json(song);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE song
router.delete('/:id', async (req, res) => {
    try {
        await SongModel.delete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;