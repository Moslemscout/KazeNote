import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CategoryModel } from '../models/category.js';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await CategoryModel.getAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create category
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const id = uuidv4();
        const category = await CategoryModel.create(id, name);
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE category
router.delete('/:id', async (req, res) => {
    try {
        await CategoryModel.delete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET songs in category
router.get('/:id/songs', async (req, res) => {
    try {
        const songs = await CategoryModel.getSongsByCategory(req.params.id);
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST add song to category
router.post('/:categoryId/songs/:songId', async (req, res) => {
    try {
        await CategoryModel.addSongToCategory(req.params.songId, req.params.categoryId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE remove song from category
router.delete('/:categoryId/songs/:songId', async (req, res) => {
    try {
        await CategoryModel.removeSongFromCategory(req.params.songId, req.params.categoryId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;