const express = require('express');
const multer = require('multer');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// Registration route with image upload
router.post('/register', upload.single('image'), registerUser);

// Login route (no file upload needed for login)
router.post('/login', loginUser);

module.exports = router;