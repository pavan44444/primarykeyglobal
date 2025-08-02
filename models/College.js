const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have this configured

const College = sequelize.define('College', {
  // Primary Key - Unique identifier for each college
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  
  // Name of the college (e.g., "Indian Institute of Technology Bombay")
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true, // College names should be unique to prevent duplicates
  },

  // City where the college is located
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  // State where the college is located
  state: {
    type: DataTypes.STRING,
    allowNull: true, // Can be null for international colleges
  },
  
  // Country where the college is located
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'India', // Assuming most colleges are in India
  },
  
  // Short name or acronym of the college (e.g., "IITB")
  shortName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // Website URL of the college
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true, // Ensures the input is a valid URL format
    }
  },
  
  // A brief description of the college
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // The year the college was established
  establishedYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  
  // Logo or image URL of the college
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true, // Ensures the input is a valid URL format
    }
  },
}, {
  // Model options
  timestamps: true, // Adds createdAt and updatedAt fields
  tableName: 'Colleges' // Explicitly set table name for clarity
});

module.exports = College;