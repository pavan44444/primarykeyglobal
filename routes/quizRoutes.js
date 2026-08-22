const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const quizController = require("../controllers/quizController");

// Get all quizzes for logged-in user's college
router.get("/", authMiddleware, quizController.getAllQuizzes);
router.get('/topic/:topic_id', quizController.getQuizByTopic);
// Insert quiz (admin only)
router.post("/insert", authMiddleware, quizController.InsertQuiz);

// ✅ Use the controller instead of inline DB query
router.get("/:quiz_id/questions", quizController.getQuizQuestions);
router.post(
  "/:quiz_id/questions/upload",
  authMiddleware,
  quizController.addQuestionsFromCSV
);
router.post('/:quiz_id/submit', authMiddleware, quizController.submitQuiz);
// Add this to your quizRoutes.js
router.get('/:quiz_id/check-submission', authMiddleware, quizController.checkQuizSubmission);
module.exports = router;
