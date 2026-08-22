const express = require('express');
const router = express.Router();
const db = require('../config/db'); // your mysql2 pool
const auth = require('../middleware/authMiddleware'); // ensure JWT is verified
//const requireAdmin = require('../middleware/requireAdmin');

// GET /api/tutorials - list all published tutorials (public)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT tutorial_id, title, slug, description, icon_url, tutorial_order
             FROM tutorials
             WHERE is_published = 1
             ORDER BY tutorial_order ASC, tutorial_id ASC`
        );
        res.json({ tutorials: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch tutorials." });
    }
});

// GET /api/tutorials/:slug - get one tutorial by slug (public)
router.get('/:slug', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT tutorial_id, title, slug, description, icon_url
             FROM tutorials WHERE slug = ? AND is_published = 1`,
            [req.params.slug]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Tutorial not found." });
        }
        res.json({ tutorial: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch tutorial." });
    }
});

// POST /api/tutorials - create new tutorial (admin only)
router.post('/', auth, requireAdmin, async (req, res) => {
    const { title, slug, description, icon_url, tutorial_order } = req.body;

    if (!title || !slug) {
        return res.status(400).json({ message: "title and slug are required." });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO tutorials (title, slug, description, icon_url, tutorial_order, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, slug, description || null, icon_url || null, tutorial_order || 0, req.user.id]
        );
        res.status(201).json({ tutorial_id: result.insertId, message: "Tutorial created." });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "A tutorial with this slug already exists." });
        }
        res.status(500).json({ message: "Failed to create tutorial." });
    }
});

module.exports = router;