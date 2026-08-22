const db = require("../config/db");

// Get all articles for a topic (public)
exports.getArticlesByTopic = async (req, res) => {
    try {
        const topicId = req.params.topic_id;

        const [articles] = await db.query(
            `SELECT article_id, topic_id, title, article_order, created_at
             FROM articles
             WHERE topic_id = ? AND is_published = 1
             ORDER BY article_order ASC, article_id ASC`,
            [topicId]
        );

        res.json({ success: true, articles });
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get single article with full content
exports.getArticleById = async (req, res) => {
    try {
        const articleId = req.params.article_id;

        const [article] = await db.query(
            `SELECT article_id, topic_id, title, content, created_at, updated_at
             FROM articles WHERE article_id = ? AND is_published = 1`,
            [articleId]
        );

        if (article.length === 0) {
            return res.status(404).json({ success: false, message: "Article not found" });
        }

        res.json({ success: true, article: article[0] });
    } catch (err) {
        console.error("Error fetching article:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Insert article under a topic (admin only)
exports.InsertArticle = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }

        const topicId = req.params.topic_id;
        const { title, content, article_order } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: "title and content are required" });
        }

        // Verify topic exists
        const [topicCheck] = await db.query(
            `SELECT topic_id FROM topics WHERE topic_id = ?`,
            [topicId]
        );

        if (topicCheck.length === 0) {
            return res.status(404).json({ success: false, message: "Topic not found" });
        }

        const [result] = await db.query(
            `INSERT INTO articles (topic_id, title, content, article_order)
             VALUES (?, ?, ?, ?)`,
            [topicId, title, content, article_order || 0]
        );

        res.json({ success: true, message: "Article created successfully", article_id: result.insertId });
    } catch (err) {
        console.error("Error inserting article:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};