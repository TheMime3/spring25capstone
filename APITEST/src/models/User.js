import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create({ email, password, firstName, lastName }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const now = new Date();

    await pool.query(
      'INSERT INTO users (id, email, password, first_name, last_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, firstName, lastName, now, now]
    );

    const [user] = await pool.query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ?',
      [userId]
    );

    return user[0];
  }

  static async comparePassword(hashedPassword, candidatePassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async createRefreshToken(userId) {
    const id = uuidv4();
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await pool.query(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [id, userId, token, expiresAt]
    );

    return { token, expiresAt };
  }

  static async findRefreshToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0];
  }

  static async deleteRefreshToken(token) {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [token]
    );
  }

  static async logAuditEvent(userId, eventType, req) {
    await pool.query(
      'INSERT INTO audit_logs (user_id, event_type, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [userId, eventType, req.ip, req.headers['user-agent']]
    );
  }
}

export default User;