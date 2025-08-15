// db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // Load variables from .env

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306, // Default MySQL port
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'PRIMARYKEY',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db;
