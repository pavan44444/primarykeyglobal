require('dotenv').config();

const mysql = require('mysql2/promise');

console.log('DB_HOST =', process.env.DB_HOST);
console.log('DB_PORT =', process.env.DB_PORT);
console.log('DB_NAME =', process.env.DB_NAME);
console.log('DB_USER =', process.env.DB_USER);

const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.DB_HOST !== 'localhost';

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Enable SSL only for production databases
    ...(isProduction && {
        ssl: {
            rejectUnauthorized: false
        }
    }),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then(conn => {
        console.log('✅ MySQL connected successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL connection error:', err);
    });

module.exports = db;