const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =============================
// ⚙️ Multer Storage Configuration
// =============================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'preparation_kits');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prep-kit-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// =============================
// 🧾 Add Preparation Kit
// =============================
const addPreparationKit = async (req, res) => {
    try {
        const { company } = req.body;
        const userId = req.user.id;
        const collegeId = req.user.college_id;

        if (!company) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'PDF file is required'
            });
        }

        // Save relative path in DB
        const relativePdfPath = path.join('uploads', 'preparation_kits', req.file.filename);

        const query = `
            INSERT INTO preparation_kits (company, preparation_kit, user_id, college_id)
            VALUES (?, ?, ?, ?)
        `;

        db.query(query, [company, relativePdfPath, userId, collegeId], (err, result) => {
            if (err) {
                // Delete file if DB insert fails
                const fullPath = path.join(__dirname, '..', relativePdfPath);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

                return res.status(500).json({
                    success: false,
                    message: 'Error adding preparation kit',
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: 'Preparation kit added successfully',
                data: {
                    id: result.insertId,
                    company: company,
                    pdfPath: relativePdfPath
                }
            });
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================
// 🏫 Get Kits for Logged-in College
// =============================
const getMyCollegePreparationKits = async (req, res) => {
    try {
        const collegeId = req.user.college_id;

        const query = `
            SELECT pk.*, u.name AS uploaded_by, c.college_name AS college_name
            FROM preparation_kits pk
            LEFT JOIN users u ON pk.user_id = u.user_id
            LEFT JOIN colleges c ON pk.college_id = c.college_id
            WHERE pk.college_id = ?
            ORDER BY pk.date_added DESC
        `;

        const [results] = await db.query(query, [collegeId]);

        res.status(200).json({
            success: true,
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================
// 🌍 Get All Preparation Kits
// =============================
const getAllPreparationKits = async (req, res) => {
    try {
        const query = `
            SELECT pk.*, u.name AS uploaded_by, c.college_name AS college_name
            FROM preparation_kits pk
            LEFT JOIN users u ON pk.user_id = u.user_id
            LEFT JOIN colleges c ON pk.college_id = c.college_id
            ORDER BY pk.id DESC
        `;

        const [results] = await db.query(query);

        res.status(200).json({
            success: true,
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================
// 🔍 Get Kit by ID
// =============================
const getPreparationKitById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT pk.*, u.name AS uploaded_by, c.college_name AS college_name
            FROM preparation_kits pk
            LEFT JOIN users u ON pk.user_id = u.user_id
            LEFT JOIN colleges c ON pk.college_id = c.college_id
            WHERE pk.id = ?
        `;

        const [results] = await db.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Preparation kit not found'
            });
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================
// ❌ Delete Preparation Kit
// =============================
const deletePreparationKit = async (req, res) => {
    try {
        const { id } = req.params;

        const selectQuery = 'SELECT preparation_kit FROM preparation_kits WHERE id = ?';

        db.query(selectQuery, [id], (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error finding preparation kit',
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Preparation kit not found'
                });
            }

            const relativeFilePath = results[0].preparation_kit;
            const absolutePath = path.join(__dirname, '..', relativeFilePath);

            const deleteQuery = 'DELETE FROM preparation_kits WHERE id = ?';

            db.query(deleteQuery, [id], (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error deleting preparation kit',
                        error: err.message
                    });
                }

                if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);

                res.status(200).json({
                    success: true,
                    message: 'Preparation kit deleted successfully'
                });
            });
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================
// 📥 Download Preparation Kit PDF
// =============================
const downloadPreparationKit = async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT preparation_kit, company FROM preparation_kits WHERE id = ?';
        const [results] = await db.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Preparation kit not found'
            });
        }

        const relativePath = results[0].preparation_kit;
        const company = results[0].company;
        const absolutePath = path.join(__dirname, '..', relativePath);

        console.log(`📂 Resolved path: ${absolutePath}`);

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({
                success: false,
                message: 'PDF file not found on server'
            });
        }

        res.download(absolutePath, `${company}-preparation-kit.pdf`, (err) => {
            if (err) {
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error downloading file',
                        error: err.message
                    });
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================
// ✅ Export
// =============================
module.exports = {
    addPreparationKit,
    getAllPreparationKits,
    getMyCollegePreparationKits,
    getPreparationKitById,
    deletePreparationKit,
    downloadPreparationKit,
    upload
};
