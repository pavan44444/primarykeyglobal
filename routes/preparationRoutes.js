const express = require('express');
const router = express.Router();
const preparationController = require('../controllers/preparationKitController');
const authMiddleware = require('../middleware/authMiddleware');

// IMPORTANT: Specific routes BEFORE parameterized routes

// Get all preparation kits
router.get('/all', 
    authMiddleware, 
    preparationController.getAllPreparationKits
);

// Download preparation kit - MUST be before /:id
// Download preparation kit - MUST be before /:id
router.get('/download/:id', 
    authMiddleware,  // ADD THIS LINE
    preparationController.downloadPreparationKit
);

// Add new preparation kit (with file upload)
router.post('/add', 
    authMiddleware, 
    preparationController.upload.single('pdfFile'),
    preparationController.addPreparationKit
);

// Delete preparation kit
router.delete('/:id', 
    authMiddleware, 
    preparationController.deletePreparationKit
);

// Get preparation kit by ID - MUST be LAST
router.get('/:id', 
    authMiddleware, 
    preparationController.getPreparationKitById
);

module.exports = router;