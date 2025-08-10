const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { addTopic, getTopics } = require("../controllers/quizTopicController");

const router = express.Router();

router.post("/add", authMiddleware, addTopic);
router.get("/", authMiddleware, getTopics);

module.exports = router;
