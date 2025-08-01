const InterviewExperience = require('../models/InterviewExperience');
const User = require('../models/User');

// Add a new interview experience
exports.addExperience = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached by checkAuth middleware
    const { passoutYear, company, rounds, description } = req.body;

    // Check if an experience already exists for this user
    const existingExperience = await InterviewExperience.findOne({ where: { userId } });
    if (existingExperience) {
      return res.status(409).json({ message: 'You have already submitted an interview experience.' });
    }

    // Find the user to get their college name
    const user = await User.findByPk(userId);
    if (!user || !user.college) {
      return res.status(400).json({ message: 'User college information is missing. Please update your profile first.' });
    }
    const collegeName = user.college;

    // Create the new experience
    const newExperience = await InterviewExperience.create({
      userId,
      collegeName,
      passoutYear,
      company,
      rounds,
      description,
    });

    res.status(201).json({
      message: 'Interview experience submitted successfully.',
      experience: newExperience,
    });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all interview experiences (Admin/Public)
exports.getAllExperiences = async (req, res) => {
    try {
        const experiences = await InterviewExperience.findAll({
            // Include the User model to display user details
            include: [{
                model: User,
                attributes: ['id', 'email'] // Select specific user attributes to display
            }]
        });
        res.status(200).json(experiences);
    } catch (error) {
        console.error('Get all experiences error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- NEW FUNCTION ---
// Get interview experiences for the authenticated user's college
exports.getExperiencesByMyCollege = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find the current user to get their college name
        const user = await User.findByPk(userId);
        if (!user || !user.college) {
            return res.status(400).json({ message: 'User college information is missing.' });
        }
        
        const collegeName = user.college;

        // Find all experiences where the collegeName matches the user's college
        const experiences = await InterviewExperience.findAll({
            where: { collegeName: collegeName },
            // Include user details to show who submitted the experience
            include: [{
                model: User,
                attributes: ['id', 'email']
            }]
        });

        res.status(200).json(experiences);
    } catch (error) {
        console.error('Get experiences by college error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
