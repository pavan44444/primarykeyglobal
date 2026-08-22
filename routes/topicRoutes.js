const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const topicController = require("../controllers/topicController");

// Get all topics for a tutorial (public)
router.get("/tutorial/:tutorial_id", topicController.getTopicsByTutorial);

// Get single topic
router.get("/:topic_id", topicController.getTopicById);

// Insert topic under a tutorial (admin only)
router.post("/tutorial/:tutorial_id/insert", authMiddleware, topicController.InsertTopic);

module.exports = router;