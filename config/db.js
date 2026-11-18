
require('dotenv').config();

const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // TiDB Cloud requires an SSL connection
    ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_CA_CERT
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then(conn => {
        console.log('✅ TiDB MySQL connection successful!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.message);
    });

module.exports = db;
