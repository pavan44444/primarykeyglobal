const db = require("../config/db");

// Get all published tutorials (public)
exports.getAllTutorials = async (req, res) => {
    try {
        const [tutorials] = await db.query(
            `SELECT tutorial_id, title, slug, description, icon_url, tutorial_order
             FROM tutorials
             WHERE is_published = 1
             ORDER BY tutorial_order ASC, tutorial_id ASC`
        );

        res.json({ success: true, tutorials });
    } catch (err) {
        console.error("Error fetching tutorials:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get single tutorial by id
exports.getTutorialById = async (req, res) => {
    try {
        const tutorialId = req.params.tutorial_id;

        const [tutorial] = await db.query(
            `SELECT tutorial_id, title, slug, description, icon_url
             FROM tutorials WHERE tutorial_id = ? AND is_published = 1`,
            [tutorialId]
        );

        if (tutorial.length === 0) {
            return res.status(404).json({ success: false, message: "Tutorial not found" });
        }

        res.json({ success: true, tutorial: tutorial[0] });
    } catch (err) {
        console.error("Error fetching tutorial:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Insert tutorial (admin only)
exports.InsertTutorial = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }

        const { title, slug, description, icon_url, tutorial_order } = req.body;

        if (!title || !slug) {
            return res.status(400).json({ success: false, message: "title and slug are required" });
        }

        const [result] = await db.query(
            `INSERT INTO tutorials (title, slug, description, icon_url, tutorial_order, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, slug, description || null, icon_url || null, tutorial_order || 0, req.user.id]
        );

        res.json({ success: true, message: "Tutorial created successfully", tutorial_id: result.insertId });
    } catch (err) {
        console.error("Error inserting tutorial:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "A tutorial with this slug already exists" });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};