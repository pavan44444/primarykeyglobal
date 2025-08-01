const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  // Primary Key - Unique identifier for each company
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },

  // Company name (e.g., "Google", "Microsoft", "Infosys")
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Company names should be unique
  },

  // Company logo URL
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // City where company is located
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // State where company is located
  state: {
    type: DataTypes.STRING,
    allowNull: true, // Can be null for international companies
  },

  // Industry type (e.g., "Technology", "Finance", "Healthcare")
  industry: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Company type (e.g., "Public", "Private", "Startup", "MNC", "Government")
  companyType: {
    type: DataTypes.STRING,
    allowNull: false,
  },

}, {
  // Model options
  timestamps: true, // Adds createdAt and updatedAt fields
  tableName: 'Companies' // Explicitly set table name
});

module.exports = Company;