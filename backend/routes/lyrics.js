import express from 'express';
import { LyricsModel } from '../models/lyric.js';

const router = express.Router();

// GET lyrics for a song
router.get('/:songId', async (req, res) => {
    try {
        const lyrics = await LyricsModel.getBySongId(req.params.songId);
        res.json(lyrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST save lyrics
router.post('/:songId', async (req, res) => {
    try {
        await LyricsModel.save(req.params.songId, req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE lyrics
router.delete('/:songId', async (req, res) => {
    try {
        await LyricsModel.delete(req.params.songId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;