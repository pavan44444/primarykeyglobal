const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const College = require('./College'); // Import the College model
const Company = require('./Company'); // Import the Company model

const CollegeCompanyVisit = sequelize.define('CollegeCompanyVisit', {
  // Primary Key - A unique identifier for each visit record
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },

  // Foreign Key for the College
  // This column will store the UUID of the college that was visited
  collegeId: {
    type: DataTypes.UUID,
    references: {
      model: College, // Reference the 'Colleges' table
      key: 'id',       // Use the 'id' column of the 'Colleges' table
    },
    allowNull: false,
  },

  // Foreign Key for the Company
  // This column will store the UUID of the company that visited
  companyId: {
    type: DataTypes.UUID,
    references: {
      model: Company, // Reference the 'Companies' table
      key: 'id',       // Use the 'id' column of the 'Companies' table
    },
    allowNull: false,
  },
  
  // Date of the campus visit or drive
  visitDate: {
    type: DataTypes.DATE,
    allowNull: true, // It might be an ongoing relationship without a specific date
    defaultValue: DataTypes.NOW,
  },

  // Type of event (e.g., "Placement Drive", "Internship Fair", "Workshop")
  eventType: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Optional: A description or additional notes about the visit
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Optional: The number of students hired during this visit
  hiredCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }

}, {
  // Model options
  timestamps: true, // Adds createdAt and updatedAt fields
  tableName: 'CollegeCompanyVisits' // Explicitly set table name for clarity
});

// Define the associations
// This is crucial for Sequelize to understand the relationships
College.belongsToMany(Company, { 
    through: CollegeCompanyVisit, 
    foreignKey: 'collegeId' 
});
Company.belongsToMany(College, { 
    through: CollegeCompanyVisit, 
    foreignKey: 'companyId' 
});

module.exports = CollegeCompanyVisit;