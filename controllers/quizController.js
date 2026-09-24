const db = require("../config/db");
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Configure multer for CSV file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `questions_${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/csv' && !file.originalname.toLowerCase().endsWith('.csv')) {
            return cb(new Error('Only CSV files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get quizzes for logged-in user's college
exports.getAllQuizzes = async (req, res) => {
    try {
        const collegeId = req.user.college_id; // from JWT middleware

        const [quizzes] = await db.query(
            `SELECT quiz_id, topic, topic_id, no_of_questions, time_seconds, points_per_question, total_points
             FROM quizzes WHERE college_id = ?`,
            [collegeId]
        );

        res.json({ success: true, quizzes });
    } catch (err) {
        console.error("Error fetching quizzes:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Insert quiz for logged-in user's college
exports.InsertQuiz = async (req, res) => {
    try {
        const { topic, topic_id, no_of_questions, time_seconds, points_per_question, total_points } = req.body;
        const collegeId = req.user.college_id; // ✅ always take from logged-in user

        if (!topic || !topic_id || !no_of_questions || !time_seconds || !points_per_question || !total_points) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const [result] = await db.query(
            `INSERT INTO quizzes (topic, topic_id, no_of_questions, time_seconds, points_per_question, total_points, college_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [topic, topic_id, no_of_questions, time_seconds, points_per_question, total_points, collegeId]
        );

        res.json({ success: true, message: "Quiz inserted successfully", quiz_id: result.insertId });
    } catch (err) {
        console.error("Error inserting quiz:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.addQuestionsFromCSV = [
    upload.single('csvFile'),
    async (req, res) => {
        try {
            const quizId = req.params.quiz_id;
            const collegeId = req.user.college_id;

            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: "CSV file is required" 
                });
            }

            // Verify quiz exists and belongs to user's college
            const [quizCheck] = await db.query(
                `SELECT quiz_id FROM quizzes WHERE quiz_id = ? AND college_id = ?`,
                [quizId, collegeId]
            );

            if (quizCheck.length === 0) {
                // Clean up uploaded file
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ 
                    success: false, 
                    message: "Quiz not found or access denied" 
                });
            }

            const questions = [];
            const errors = [];
            let lineNumber = 1;

            // Read and parse CSV file
            const stream = fs.createReadStream(req.file.path)
                .pipe(csv({
                    headers: ['question_text', 'option1', 'option2', 'option3', 'option4', 'correct_option'],
                    skipEmptyLines: true
                }));

            stream.on('data', (row) => {
                lineNumber++;
                
                // Validate required fields
                const requiredFields = ['question_text', 'option1', 'option2', 'option3', 'option4', 'correct_option'];
                const missingFields = requiredFields.filter(field => !row[field] || row[field].trim() === '');
                
                if (missingFields.length > 0) {
                    errors.push(`Line ${lineNumber}: Missing fields - ${missingFields.join(', ')}`);
                    return;
                }

                // Validate correct_option is between 1-4
                const correctOption = parseInt(row.correct_option);
                if (isNaN(correctOption) || correctOption < 1 || correctOption > 4) {
                    errors.push(`Line ${lineNumber}: correct_option must be 1, 2, 3, or 4`);
                    return;
                }

                questions.push({
                    quiz_id: quizId,
                    topic_id: req.body.topic_id || null, // Optional: can be passed from frontend
                    question_text: row.question_text.trim(),
                    option1: row.option1.trim(),
                    option2: row.option2.trim(),
                    option3: row.option3.trim(),
                    option4: row.option4.trim(),
                    correct_option: correctOption
                });
            });

            stream.on('end', async () => {
                try {
                    // Clean up uploaded file
                    fs.unlinkSync(req.file.path);

                    if (errors.length > 0) {
                        return res.status(400).json({
                            success: false,
                            message: "CSV validation errors",
                            errors: errors
                        });
                    }

                    if (questions.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message: "No valid questions found in CSV"
                        });
                    }

                    // Insert questions into database
                    const insertPromises = questions.map(question => {
                        return db.query(
                            `INSERT INTO questions (quiz_id, topic_id, question_text, option1, option2, option3, option4, correct_option) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                question.quiz_id,
                                question.topic_id,
                                question.question_text,
                                question.option1,
                                question.option2,
                                question.option3,
                                question.option4,
                                question.correct_option
                            ]
                        );
                    });

                    await Promise.all(insertPromises);

                    res.json({
                        success: true,
                        message: `Successfully added ${questions.length} questions to the quiz`,
                        questionsAdded: questions.length
                    });

                } catch (dbError) {
                    console.error("Database error:", dbError);
                    res.status(500).json({
                        success: false,
                        message: "Error saving questions to database"
                    });
                }
            });

            stream.on('error', (error) => {
                console.error("CSV parsing error:", error);
                fs.unlinkSync(req.file.path); // Clean up
                res.status(500).json({
                    success: false,
                    message: "Error parsing CSV file"
                });
            });

        } catch (err) {
            console.error("Error adding questions:", err);
            
            // Clean up file if it exists
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            if (err.message === 'Only CSV files are allowed!') {
                return res.status(400).json({
                    success: false,
                    message: "Only CSV files are allowed"
                });
            }

            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
];
// Get quiz + questions for a topic (used by quizinterface.html)
exports.getQuizByTopic = async (req, res) => {
    try {
        const topicId = req.params.topic_id;

        const [quizRows] = await db.query(
            `SELECT quiz_id, topic, topic_id, no_of_questions, time_seconds, points_per_question, total_points
             FROM quizzes
             WHERE topic_id = ?
             LIMIT 1`,
            [topicId]
        );

        if (quizRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No quiz found for this topic"
            });
        }

        const quiz = quizRows[0];

        const [questions] = await db.query(
            `SELECT question_id, question_text, option1, option2, option3, option4
             FROM questions
             WHERE quiz_id = ?`,
            [quiz.quiz_id]
        );

        res.json({
            success: true,
            quiz,
            questions,
            total: questions.length
        });

    } catch (err) {
        console.error("Error fetching quiz by topic:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
// Get questions for a specific quiz (updated)
exports.getQuizQuestions = async (req, res) => {
    try {
        const quizId = req.params.quiz_id;

        const [quizCheck] = await db.query(
            `SELECT quiz_id FROM quizzes WHERE quiz_id = ?`,
            [quizId]
        );

        if (quizCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        const [questions] = await db.query(
            `SELECT question_id, question_text, option1, option2, option3, option4
             FROM questions WHERE quiz_id = ?`,
            [quizId]
        );

        res.json({
            success: true,
            questions,
            total: questions.length
        });

    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const { updateUserStreak, checkAndUpdatePrimaryKey } = require("./streakController");

exports.submitQuiz = async (req, res) => {
    try {
        const quizId = req.params.quiz_id;
        const userId = req.user.id; // matches your JWT payload
        const { answers, completion_time } = req.body;

        console.log('Submit Quiz Request:', { quizId, userId, answersReceived: answers });

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Answers array is required"
            });
        }

        // Check if already submitted
        const [existingSubmission] = await db.query(
            `SELECT submission_id FROM quiz_submissions 
             WHERE user_id = ? AND quiz_id = ?`,
            [userId, quizId]
        );

        if (existingSubmission.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Quiz already submitted. You cannot submit the same quiz twice.",
                already_submitted: true
            });
        }

        // Verify quiz exists — no college_id filter anymore
        const [quizCheck] = await db.query(
            `SELECT quiz_id, points_per_question, total_points 
             FROM quizzes 
             WHERE quiz_id = ?`,
            [quizId]
        );

        if (quizCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        const quiz = quizCheck[0];

        const [questions] = await db.query(
            `SELECT question_id, correct_option 
             FROM questions 
             WHERE quiz_id = ?`,
            [quizId]
        );

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No questions found for this quiz"
            });
        }

        const correctAnswersMap = {};
        questions.forEach(q => {
            correctAnswersMap[q.question_id] = q.correct_option;
        });

        let correctAnswers = 0;
        let wrongAnswers = 0;
        const results = [];

        answers.forEach(answer => {
            const questionId = answer.question_id;
            const selectedOption = answer.selected_option;

            let userAnswer = null;
            if (selectedOption === 'option1') userAnswer = 1;
            else if (selectedOption === 'option2') userAnswer = 2;
            else if (selectedOption === 'option3') userAnswer = 3;
            else if (selectedOption === 'option4') userAnswer = 4;

            const correctOption = correctAnswersMap[questionId];
            const isCorrect = userAnswer === correctOption;

            if (isCorrect) {
                correctAnswers++;
            } else {
                wrongAnswers++;
            }

            results.push({
                question_id: questionId,
                user_answer: userAnswer,
                correct_answer: correctOption,
                is_correct: isCorrect
            });
        });

        const totalQuestions = questions.length;
        const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const pointsEarned = correctAnswers * quiz.points_per_question;

        const [submission] = await db.query(
            `INSERT INTO quiz_submissions 
             (user_id, quiz_id, score, correct_answers, wrong_answers, points_earned, time_taken, submitted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [userId, quizId, scorePercentage, correctAnswers, wrongAnswers, pointsEarned, completion_time || null]
        );

        const submissionId = submission.insertId;

      // Calculate total points from all quiz submissions
await db.query(
    `UPDATE users
     SET total_points = (
         SELECT COALESCE(SUM(points_earned), 0)
         FROM quiz_submissions
         WHERE user_id = ?
     )
     WHERE user_id = ?`,
    [userId, userId]
);

        // Streak tracking + primarykey rank check — run after points are finalized
        const streakResult = await updateUserStreak(userId, pointsEarned);
        const primaryKeyResult = await checkAndUpdatePrimaryKey();

        res.json({
            success: true,
            message: "Quiz submitted successfully",
            submission: {
                submission_id: submissionId,
                score: scorePercentage.toFixed(2),
                correct_answers: correctAnswers,
                wrong_answers: wrongAnswers,
                total_questions: totalQuestions,
                points_earned: pointsEarned,
                results: results,
                streak: streakResult,
                primaryKey: primaryKeyResult
            }
        });

    } catch (err) {
        console.error("Error submitting quiz:", err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
};
exports.checkQuizSubmission = async (req, res) => {
    try {
        const quizId = req.params.quiz_id;
        const userId = req.user.id;

        const [quizCheck] = await db.query(
            `SELECT quiz_id FROM quizzes WHERE quiz_id = ?`,
            [quizId]
        );

        if (quizCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        const [submission] = await db.query(
            `SELECT submission_id, score, correct_answers, wrong_answers, 
                    points_earned, submitted_at
             FROM quiz_submissions
             WHERE user_id = ? AND quiz_id = ?`,
            [userId, quizId]
        );

        if (submission.length > 0) {
            return res.json({
                success: true,
                already_submitted: true,
                submission: submission[0]
            });
        }

        res.json({
            success: true,
            already_submitted: false
        });

    } catch (err) {
        console.error("Error checking submission:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};