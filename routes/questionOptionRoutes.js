// routes/questionOptionRoutes.js
const express = require("express");
const router = express.Router();
const questionOptionController = require("../controllers/questionOptionController");

router.post("/", questionOptionController.createOption);
router.get("/", questionOptionController.getAllOptions);
router.get("/question/:question_id", questionOptionController.getOptionsByQuestionId);
router.put("/:id", questionOptionController.updateOption);
router.delete("/:id", questionOptionController.deleteOption);

module.exports = router;
