// models/user.js

const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Create a new PostgreSQL client
const client = new Client(process.env.DATABASE_URL);

// Connect to the database
client.connect();

class User {
  static async createUser(username, email, password,first_name, last_name) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users (username, email, password_hash, subscription_level, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id',
      values: [username, email, hashedPassword, 1, first_name, last_name],
    };

    const result = await client.query(query);
    return result.rows[0].user_id;
  }

  static async findByEmail(email) {
    const query = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email],
    };

    const result = await client.query(query);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE user_id = $1',
      values: [id],
    };

    const result = await client.query(query);
    return result.rows[0] || null;
  }

  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }
}

module.exports = User;
