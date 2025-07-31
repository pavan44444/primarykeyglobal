const College = require('../models/College');
const User = require('../models/User');

// --- ADMIN-ONLY FUNCTIONS ---

// Add a new college (Admin-only)
exports.addCollege = async (req, res) => {
  try {
    const { name, city, state, country } = req.body;

    // Optional: Basic input validation
    if (!name || !city || !country) {
      return res.status(400).json({ message: 'College name, city, and country are required.' });
    }

    const college = await College.create({
      name,
      city,
      state,
      country,
      // Add any other fields from your model here
    });

    res.status(201).json({ 
      message: 'College added successfully', 
      college 
    });
  } catch (error) {
    console.error('Add college error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a college (Admin-only)
exports.deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await College.destroy({
      where: { id: id }
    });

    if (deleted) {
      return res.status(204).send(); // 204 No Content
    }

    res.status(404).json({ message: 'College not found.' });
  } catch (error) {
    console.error('Delete college error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all colleges (Admin-only)
exports.getAllColleges = async (req, res) => {
  try {
    const colleges = await College.findAll();
    // Add a console.log to see the result
    console.log('Fetched colleges:', colleges); 
    res.status(200).json(colleges);
  } catch (error) {
    console.error('Get all colleges error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- USER-ONLY FUNCTIONS ---

// Get a user's college
exports.getUserCollege = async (req, res) => {
  try {
    // We get the user ID from the authenticated request object
    const userId = req.user.id; 
    
    // Find the user and their college
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Now, find the college based on the college name stored in the user's record
    const college = await College.findOne({
      where: { name: user.college }
    });

    if (!college) {
      return res.status(404).json({ message: 'College not found for this user.' });
    }

    res.status(200).json(college);
  } catch (error) {
    console.error('Get user college error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};