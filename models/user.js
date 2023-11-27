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

  static async checkIfPersonalised(user_id) {
    try {
        // Check if the user has dateofbirth and education_level
        const query = {
            text: `
                SELECT dateofbirth, education_level
                FROM public.users
                WHERE user_id = $1;
            `,
            values: [user_id],
        };

        const result = await client.query(query);

        // If the user is found and has both date_of_birth and education_level
        return (
          result.rows.length > 0 &&
          result.rows[0].dateofbirth !== null &&
          result.rows[0].dateofbirth !== '' &&
          result.rows[0].education_level !== null &&
          result.rows[0].education_level !== ''
      );
    } catch (error) {
        // Handle the error, e.g., log it or throw an exception
        console.error('Error checking personalized status:', error);
        throw error;
    }
  }

  static async personaliseUser(user_id, dateofbirth, education_level) {

    const query = {
      text: `
        UPDATE public.users
        SET dateofbirth = $2, education_level = $3
        WHERE user_id = $1;
      `,
      values: [user_id, dateofbirth, education_level],
    };
    

    await client.query(query);
    
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
