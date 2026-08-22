const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const tutorialController = require("../controllers/tutorialController");

// Get all tutorials (public)
router.get("/", tutorialController.getAllTutorials);

// Get single tutorial
router.get("/:tutorial_id", tutorialController.getTutorialById);

// Insert tutorial (admin only)
router.post("/insert", authMiddleware, tutorialController.InsertTutorial);

module.exports = router;