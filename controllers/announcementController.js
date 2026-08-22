const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/announcements');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'announcement-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

const announcementController = {
    // Multer middleware export
    uploadImage: upload.single('image'),

    // Create new announcement (Admin only)
    createAnnouncement: async (req, res) => {
        try {
            const { title, content } = req.body;
            const adminId = req.user.id;
            const collegeId = req.user.college_id;
            const imagePath = req.file ? `/uploads/announcements/${req.file.filename}` : null;

            console.log('Creating announcement:', { adminId, collegeId, title, content, imagePath });

            // Validation
            if (!title || !content) {
                return res.status(400).json({ 
                    error: 'Title and content are required' 
                });
            }

            if (title.length > 255) {
                return res.status(400).json({ 
                    error: 'Title must be less than 255 characters' 
                });
            }

            const insertQuery = `
                INSERT INTO announcements 
                (college_id, admin_id, title, content, image_url, is_active)
                VALUES (?, ?, ?, ?, ?, 1)
            `;

            const [result] = await db.query(insertQuery, [
                collegeId,
                adminId,
                title,
                content,
                imagePath
            ]);

            res.status(201).json({
                message: 'Announcement created successfully',
                announcement: {
                    announcement_id: result.insertId,
                    title,
                    content,
                    image_url: imagePath,
                    is_active: true,
                    created_at: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Create announcement error:', error);
            res.status(500).json({ 
                error: 'Failed to create announcement',
                details: error.message 
            });
        }
    },

    // Get all announcements for admin's college (Admin view)
    getAllAnnouncementsForAdmin: async (req, res) => {
        try {
            const collegeId = req.user.college_id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const status = req.query.status;
            const month = req.query.month; // Format: YYYY-MM
            const year = req.query.year; // Format: YYYY

            let whereConditions = ['a.college_id = ?'];
            let queryParams = [collegeId];

            // Status filter
            if (status === 'active') {
                whereConditions.push('a.is_active = 1');
            } else if (status === 'inactive') {
                whereConditions.push('a.is_active = 0');
            }

            // Date filters
            if (year) {
                if (month) {
                    // Filter by specific month and year
                    whereConditions.push('YEAR(a.created_at) = ? AND MONTH(a.created_at) = ?');
                    queryParams.push(parseInt(year), parseInt(month));
                } else {
                    // Filter by year only
                    whereConditions.push('YEAR(a.created_at) = ?');
                    queryParams.push(parseInt(year));
                }
            }

            const whereClause = whereConditions.join(' AND ');

            const query = `
                SELECT a.*, u.name as admin_name
                FROM announcements a
                LEFT JOIN users u ON a.admin_id = u.user_id
                WHERE ${whereClause}
                ORDER BY a.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const countQuery = `
                SELECT COUNT(*) as total
                FROM announcements a
                WHERE ${whereClause}
            `;

            queryParams.push(limit, offset);
            const countParams = queryParams.slice(0, -2);

            const [announcements] = await db.query(query, queryParams);
            const [countResult] = await db.query(countQuery, countParams);

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            console.log('Fetched announcements:', announcements.length);

            res.json({
                announcements,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: limit
                },
                filters: {
                    status,
                    month,
                    year
                }
            });

        } catch (error) {
            console.error('Get admin announcements error:', error);
            res.status(500).json({ 
                error: 'Failed to fetch announcements',
                details: error.message 
            });
        }
    },

    // Get announcements for student's college
    getAnnouncementsForCollege: async (req, res) => {
        try {
            const collegeId = req.user.college_id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const month = req.query.month;
            const year = req.query.year;

            let whereConditions = ['a.college_id = ?', 'a.is_active = 1'];
            let queryParams = [collegeId];

            // Date filters
            if (year) {
                if (month) {
                    whereConditions.push('YEAR(a.created_at) = ? AND MONTH(a.created_at) = ?');
                    queryParams.push(parseInt(year), parseInt(month));
                } else {
                    whereConditions.push('YEAR(a.created_at) = ?');
                    queryParams.push(parseInt(year));
                }
            }

            const whereClause = whereConditions.join(' AND ');

            const query = `
                SELECT a.announcement_id, a.title, a.content, a.image_url,
                       a.created_at, a.updated_at, a.is_active, u.name as posted_by
                FROM announcements a
                LEFT JOIN users u ON a.admin_id = u.user_id
                WHERE ${whereClause}
                ORDER BY a.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const countQuery = `
                SELECT COUNT(*) as total
                FROM announcements a
                WHERE ${whereClause}
            `;

            queryParams.push(limit, offset);
            const countParams = queryParams.slice(0, -2);

            const [announcements] = await db.query(query, queryParams);
            const [countResult] = await db.query(countQuery, countParams);

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            const formattedAnnouncements = announcements.map(announcement => ({
                ...announcement,
                time_ago: getTimeAgo(announcement.created_at)
            }));

            res.json({
                announcements: formattedAnnouncements,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: limit
                },
                filters: {
                    month,
                    year
                }
            });

        } catch (error) {
            console.error('Get college announcements error:', error);
            res.status(500).json({ 
                error: 'Failed to fetch announcements',
                details: error.message 
            });
        }
    },

    // Get announcement by ID
    getAnnouncementById: async (req, res) => {
        try {
            const announcementId = req.params.id;
            const collegeId = req.user.college_id;

            const query = `
                SELECT a.*, u.name as posted_by
                FROM announcements a
                LEFT JOIN users u ON a.admin_id = u.user_id
                WHERE a.announcement_id = ? AND a.college_id = ? AND a.is_active = 1
            `;

            const [result] = await db.query(query, [announcementId, collegeId]);

            if (result.length === 0) {
                return res.status(404).json({ 
                    error: 'Announcement not found or not accessible' 
                });
            }

            const announcement = {
                ...result[0],
                time_ago: getTimeAgo(result[0].created_at)
            };

            res.json({ announcement });

        } catch (error) {
            console.error('Get announcement by ID error:', error);
            res.status(500).json({ 
                error: 'Failed to fetch announcement',
                details: error.message 
            });
        }
    },

    // Update announcement (Admin only)
    updateAnnouncement: async (req, res) => {
        try {
            const announcementId = req.params.id;
            const { title, content } = req.body;
            const collegeId = req.user.college_id;
            const imagePath = req.file ? `/uploads/announcements/${req.file.filename}` : null;

            if (!title && !content && !imagePath) {
                return res.status(400).json({ 
                    error: 'At least one field (title, content, or image) is required for update' 
                });
            }

            const checkQuery = `
                SELECT * FROM announcements 
                WHERE announcement_id = ? AND college_id = ?
            `;
            const [existingAnnouncement] = await db.query(checkQuery, [announcementId, collegeId]);

            if (existingAnnouncement.length === 0) {
                return res.status(404).json({ 
                    error: 'Announcement not found or access denied' 
                });
            }

            // Delete old image if new image is uploaded
            if (imagePath && existingAnnouncement[0].image_url) {
                const oldImagePath = path.join(__dirname, '..', existingAnnouncement[0].image_url);
                try {
                    await fs.unlink(oldImagePath);
                } catch (err) {
                    console.log('Old image deletion failed:', err.message);
                }
            }

            let updateFields = [];
            let updateParams = [];

            if (title) {
                if (title.length > 255) {
                    return res.status(400).json({ 
                        error: 'Title must be less than 255 characters' 
                    });
                }
                updateFields.push('title = ?');
                updateParams.push(title);
            }

            if (content) {
                updateFields.push('content = ?');
                updateParams.push(content);
            }

            if (imagePath) {
                updateFields.push('image_url = ?');
                updateParams.push(imagePath);
            }

            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            updateParams.push(announcementId);

            const updateQuery = `
                UPDATE announcements 
                SET ${updateFields.join(', ')}
                WHERE announcement_id = ?
            `;

            await db.query(updateQuery, updateParams);

            res.json({ 
                message: 'Announcement updated successfully',
                updated_fields: {
                    title: title || existingAnnouncement[0].title,
                    content: content || existingAnnouncement[0].content,
                    image_url: imagePath || existingAnnouncement[0].image_url
                }
            });

        } catch (error) {
            console.error('Update announcement error:', error);
            res.status(500).json({ 
                error: 'Failed to update announcement',
                details: error.message 
            });
        }
    },

    // Toggle announcement status (Admin only)
    toggleAnnouncementStatus: async (req, res) => {
        try {
            const announcementId = req.params.id;
            const collegeId = req.user.college_id;

            const checkQuery = `
                SELECT is_active FROM announcements 
                WHERE announcement_id = ? AND college_id = ?
            `;
            const [existingAnnouncement] = await db.query(checkQuery, [announcementId, collegeId]);

            if (existingAnnouncement.length === 0) {
                return res.status(404).json({ 
                    error: 'Announcement not found or access denied' 
                });
            }

            const currentStatus = existingAnnouncement[0].is_active;
            const newStatus = currentStatus ? 0 : 1;

            const updateQuery = `
                UPDATE announcements 
                SET is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE announcement_id = ?
            `;

            await db.query(updateQuery, [newStatus, announcementId]);

            res.json({ 
                message: `Announcement ${newStatus ? 'activated' : 'deactivated'} successfully`,
                is_active: Boolean(newStatus)
            });

        } catch (error) {
            console.error('Toggle announcement status error:', error);
            res.status(500).json({ 
                error: 'Failed to toggle announcement status',
                details: error.message 
            });
        }
    },

    // Delete announcement (Admin only)
    deleteAnnouncement: async (req, res) => {
        try {
            const announcementId = req.params.id;
            const collegeId = req.user.college_id;

            const checkQuery = `
                SELECT title, image_url FROM announcements 
                WHERE announcement_id = ? AND college_id = ?
            `;
            const [existingAnnouncement] = await db.query(checkQuery, [announcementId, collegeId]);

            if (existingAnnouncement.length === 0) {
                return res.status(404).json({ 
                    error: 'Announcement not found or access denied' 
                });
            }

            // Delete associated image if exists
            if (existingAnnouncement[0].image_url) {
                const imagePath = path.join(__dirname, '..', existingAnnouncement[0].image_url);
                try {
                    await fs.unlink(imagePath);
                } catch (err) {
                    console.log('Image deletion failed:', err.message);
                }
            }

            const deleteQuery = `DELETE FROM announcements WHERE announcement_id = ?`;
            await db.query(deleteQuery, [announcementId]);

            res.json({ 
                message: 'Announcement deleted successfully',
                deleted_announcement: {
                    id: announcementId,
                    title: existingAnnouncement[0].title
                }
            });

        } catch (error) {
            console.error('Delete announcement error:', error);
            res.status(500).json({ 
                error: 'Failed to delete announcement',
                details: error.message 
            });
        }
    }
};

// Helper function to calculate time ago
function getTimeAgo(date) {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const announcementDate = new Date(date);
    const diffInSeconds = Math.floor((now - announcementDate) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return announcementDate.toLocaleDateString();
    }
}

module.exports = announcementController;