
require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');

// Read the TiDB CA certificate.
// Supports either a certificate file path or certificate contents
// stored directly in Render environment variables.
let sslConfig = {
    rejectUnauthorized: true
};

if (process.env.DB_CA_CERT) {
    sslConfig.ca = process.env.DB_CA_CERT.replace(/\\n/g, '\n');
} else if (process.env.DB_CA_CERT_PATH) {
    sslConfig.ca = fs.readFileSync(process.env.DB_CA_CERT_PATH, 'utf8');
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: sslConfig,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testDatabaseConnection() {
    let connection;

    try {
        connection = await db.getConnection();

        const [rows] = await connection.query(
            'SELECT DATABASE() AS databaseName, VERSION() AS databaseVersion'
        );

        console.log('✅ TiDB database connected successfully!');
        console.log('Database:', rows[0].databaseName);
        console.log('Version:', rows[0].databaseVersion);

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

testDatabaseConnection();

module.exports = db;
