const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
//const  = require('../middleware/');

// GET /api/tutorials/:tutorialId/topics - list topics for a tutorial (public)
router.get('/tutorials/:tutorialId/topics', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT topic_id, tutorial_id, title, slug, description, topic_order
             FROM topics
             WHERE tutorial_id = ? AND is_published = 1
             ORDER BY topic_order ASC, topic_id ASC`,
            [req.params.tutorialId]
        );
        res.json({ topics: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch topics." });
    }
});

// GET /api/topics/:topicId - single topic detail (public)
router.get('/topics/:topicId', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT topic_id, tutorial_id, title, slug, description
             FROM topics WHERE topic_id = ? AND is_published = 1`,
            [req.params.topicId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Topic not found." });
        }
        res.json({ topic: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch topic." });
    }
});

// POST /api/tutorials/:tutorialId/topics - create topic under a tutorial (admin only)
router.post('/tutorials/:tutorialId/topics', auth,  async (req, res) => {
    const { title, slug, description, topic_order } = req.body;
    const { tutorialId } = req.params;

    if (!title || !slug) {
        return res.status(400).json({ message: "title and slug are required." });
    }

    try {
        // confirm tutorial exists
        const [tutorial] = await db.query(
            `SELECT tutorial_id FROM tutorials WHERE tutorial_id = ?`,
            [tutorialId]
        );
        if (tutorial.length === 0) {
            return res.status(404).json({ message: "Tutorial not found." });
        }

        const [result] = await db.query(
            `INSERT INTO topics (tutorial_id, title, slug, description, topic_order)
             VALUES (?, ?, ?, ?, ?)`,
            [tutorialId, title, slug, description || null, topic_order || 0]
        );
        res.status(201).json({ topic_id: result.insertId, message: "Topic created." });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "A topic with this slug already exists in this tutorial." });
        }
        res.status(500).json({ message: "Failed to create topic." });
    }
});

module.exports = router;