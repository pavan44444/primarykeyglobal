const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { addCategory, getCategories } = require("../controllers/quizCategoryController");

const router = express.Router();

router.post("/add", authMiddleware, addCategory);
router.get("/", authMiddleware, getCategories);

module.exports = router;
