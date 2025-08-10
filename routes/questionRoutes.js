const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { addQuestion, getQuestions } = require("../controllers/questionController");

const router = express.Router();

router.post("/add", authMiddleware, addQuestion);
router.get("/", authMiddleware, getQuestions);

module.exports = router;
