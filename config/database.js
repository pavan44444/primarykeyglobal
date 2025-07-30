const { Sequelize } = require('sequelize');

// Replace these values with your actual DB credentials
const sequelize = new Sequelize('primarykey', 'root', '', {
  host: 'localhost',
  dialect: 'mysql', // or 'postgres'
});

module.exports = sequelize;
