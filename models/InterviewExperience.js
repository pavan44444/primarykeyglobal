// models/InterviewExperience.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Import the User model

const InterviewExperience = sequelize.define('InterviewExperience', {
  // Primary Key - Unique identifier for each experience
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  
  // Link to the user who submitted the experience
  // Enforcing uniqueness here ensures a user can only submit one experience
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    unique: true, // This is the key constraint for "only once"
    allowNull: false,
  },

  // The college name at the time of submission (from the user's profile)
  collegeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // The year the user passed out
  passoutYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // The name of the company where the user got placed
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // The number of interview rounds
  rounds: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // You can add more fields here like 'description', 'difficulty', etc.
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  // Model options
  timestamps: true, // Adds createdAt and updatedAt fields
  tableName: 'InterviewExperiences'
});

// Define the relationship: An InterviewExperience belongs to a User
// This automatically adds the `userId` foreign key
InterviewExperience.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(InterviewExperience, { foreignKey: 'userId' });

module.exports = InterviewExperience;
