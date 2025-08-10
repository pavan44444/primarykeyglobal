const express = require('express');
const router = express.Router();
const controller = require('../controllers/quizAttemptController');

router.post('/', controller.createAttempt);
router.get('/', controller.getAllAttempts);
router.get('/:id', controller.getAttemptById);
router.put('/:id', controller.updateAttempt);
router.delete('/:id', controller.deleteAttempt);

module.exports = router;
