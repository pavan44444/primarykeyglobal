const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// GET /api/topics/:topicId/articles - list articles for a topic (public)
router.get('/topics/:topicId/articles', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT article_id, topic_id, title, article_order, created_at
             FROM articles
             WHERE topic_id = ? AND is_published = 1
             ORDER BY article_order ASC, article_id ASC`,
            [req.params.topicId]
        );
        res.json({ articles: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch articles." });
    }
});

// GET /api/articles/:articleId - full article content (public)
router.get('/articles/:articleId', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT article_id, topic_id, title, content, created_at, updated_at
             FROM articles WHERE article_id = ? AND is_published = 1`,
            [req.params.articleId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Article not found." });
        }
        res.json({ article: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch article." });
    }
});

// POST /api/topics/:topicId/articles - create article under a topic (admin only)
router.post('/topics/:topicId/articles', auth, requireAdmin, async (req, res) => {
    const { title, content, article_order } = req.body;
    const { topicId } = req.params;

    if (!title || !content) {
        return res.status(400).json({ message: "title and content are required." });
    }

    try {
        const [topic] = await db.query(
            `SELECT topic_id FROM topics WHERE topic_id = ?`,
            [topicId]
        );
        if (topic.length === 0) {
            return res.status(404).json({ message: "Topic not found." });
        }

        const [result] = await db.query(
            `INSERT INTO articles (topic_id, title, content, article_order)
             VALUES (?, ?, ?, ?)`,
            [topicId, title, content, article_order || 0]
        );
        res.status(201).json({ article_id: result.insertId, message: "Article created." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create article." });
    }
});

module.exports = router;