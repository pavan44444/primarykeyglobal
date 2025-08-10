const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

const authMiddleware = require("../middleware/authMiddleware");

//router.post("/add", authMiddleware, addCategory);
//router.get("/", authMiddleware, getCategories);

// Create quiz
router.post("/", quizController.createQuiz);

// Get all quizzes
router.get("/", quizController.getAllQuizzes);

// Get quiz by ID
router.get("/:quiz_id", quizController.getQuizById);

// Update quiz
router.put("/:quiz_id", quizController.updateQuiz);

// Delete quiz
router.delete("/:quiz_id", quizController.deleteQuiz);

module.exports = router;
