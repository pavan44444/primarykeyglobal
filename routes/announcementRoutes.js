const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin middleware
const requireAdmin = (req, res, next) => {
    console.log('RequireAdmin middleware - User:', req.user); // Debug log
    
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Authentication required' 
        });
    }
    
    if (req.user.is_admin === 1 || req.user.isAdmin === true || req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            error: 'Access denied. Admin privileges required.' 
        });
    }
};

// =============================================
// IMPORTANT: Specific routes BEFORE dynamic routes
// =============================================

// Admin Routes - Get all announcements for admin's college
router.get('/admin/all', 
    authMiddleware, 
    requireAdmin, 
    announcementController.getAllAnnouncementsForAdmin
);

// Student Routes - Get announcements for student's college
router.get('/college', 
    authMiddleware, 
    announcementController.getAnnouncementsForCollege
);

// Admin Routes - Create announcement (with image upload)
router.post('/', 
    authMiddleware, 
    requireAdmin, 
    announcementController.uploadImage, 
    announcementController.createAnnouncement
);

// Admin Routes - Toggle announcement status (active/inactive)
// MUST come before /:id to avoid "toggle-status" being treated as an ID
router.patch('/:id/toggle-status', 
    authMiddleware, 
    requireAdmin, 
    announcementController.toggleAnnouncementStatus
);

// Admin Routes - Update announcement (with image upload)
router.put('/:id', 
    authMiddleware, 
    requireAdmin, 
    announcementController.uploadImage, 
    announcementController.updateAnnouncement
);

// Admin Routes - Delete announcement
router.delete('/:id', 
    authMiddleware, 
    requireAdmin, 
    announcementController.deleteAnnouncement
);

// Get specific announcement by ID (MUST BE LAST)
router.get('/:id', 
    authMiddleware, 
    announcementController.getAnnouncementById
);

module.exports = router;