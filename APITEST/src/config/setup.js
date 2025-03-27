import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  // Create connection without database selected
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_email (email)
      )
    `);
    console.log('Users table created or already exists');

    // Create refresh_tokens table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_tokens (user_id)
      )
    `);
    console.log('Refresh tokens table created or already exists');

    // Create audit_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36),
        event_type ENUM('login', 'logout', 'register', 'password_change', 'token_refresh') NOT NULL,
        ip_address VARCHAR(45),
        user_agent VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_audit (user_id),
        INDEX idx_event_type (event_type),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('Audit logs table created or already exists');

    // Create questionnaires table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS questionnaires (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        responses JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_questionnaires (user_id)
      )
    `);
    console.log('Questionnaires table created or already exists');

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

setupDatabase().catch(console.error);