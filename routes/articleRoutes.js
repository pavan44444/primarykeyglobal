const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const articleController = require("../controllers/articleController");

// Get all articles for a topic (public)
router.get("/topic/:topic_id", articleController.getArticlesByTopic);

// Get single article
router.get("/:article_id", articleController.getArticleById);

// Insert article under a topic (admin only)
router.post("/topic/:topic_id/insert", authMiddleware, articleController.InsertArticle);

module.exports = router;