const db = require("../config/db");

// Get all topics for a tutorial (public)
exports.getTopicsByTutorial = async (req, res) => {
    try {
        const tutorialId = req.params.tutorial_id;

        const [topics] = await db.query(
            `SELECT topic_id, tutorial_id, title, slug, description, topic_order
             FROM topics
             WHERE tutorial_id = ? AND is_published = 1
             ORDER BY topic_order ASC, topic_id ASC`,
            [tutorialId]
        );

        res.json({ success: true, topics });
    } catch (err) {
        console.error("Error fetching topics:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get single topic by id
exports.getTopicById = async (req, res) => {
    try {
        const topicId = req.params.topic_id;

        const [topic] = await db.query(
            `SELECT topic_id, tutorial_id, title, slug, description
             FROM topics WHERE topic_id = ? AND is_published = 1`,
            [topicId]
        );

        if (topic.length === 0) {
            return res.status(404).json({ success: false, message: "Topic not found" });
        }

        res.json({ success: true, topic: topic[0] });
    } catch (err) {
        console.error("Error fetching topic:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Insert topic under a tutorial (admin only)
exports.InsertTopic = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }

        const tutorialId = req.params.tutorial_id;
        const { title, slug, description, topic_order } = req.body;

        if (!title || !slug) {
            return res.status(400).json({ success: false, message: "title and slug are required" });
        }

        // Verify tutorial exists
        const [tutorialCheck] = await db.query(
            `SELECT tutorial_id FROM tutorials WHERE tutorial_id = ?`,
            [tutorialId]
        );

        if (tutorialCheck.length === 0) {
            return res.status(404).json({ success: false, message: "Tutorial not found" });
        }

        const [result] = await db.query(
            `INSERT INTO topics (tutorial_id, title, slug, description, topic_order)
             VALUES (?, ?, ?, ?, ?)`,
            [tutorialId, title, slug, description || null, topic_order || 0]
        );

        res.json({ success: true, message: "Topic created successfully", topic_id: result.insertId });
    } catch (err) {
        console.error("Error inserting topic:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "A topic with this slug already exists in this tutorial" });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};