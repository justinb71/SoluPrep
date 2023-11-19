const { Client } = require("pg");
require('dotenv').config();

// Function to get user's monthly experiences
async function updateUserById(userId) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    const query = `
      UPDATE public.users
      SET first_name = 'Justin', last_name = 'Brown'
      WHERE user_id = $1
    `;

    const result = await client.query(query, [userId]);
    console.log(result.rows);
    return result.rows;
  } catch (err) {
    console.error("Error querying database:", err);
    return [];
  } finally {
    await client.end();
  }
}

updateUserById("2");

// // Function to add or update monthly experience
// async function addOrUpdateMonthlyExperience(userId, month, experienceGained) {
//   const client = new Client(process.env.DATABASE_URL);
//   try {
//     await client.connect();

//     // Check if a record already exists for the given month and user
//     const checkQuery = `
//       SELECT experience_gained
//       FROM "MonthlyExperience"
//       WHERE user_id = $1 AND month = $2;
//     `;

//     const checkValues = [userId, month];

//     const checkResult = await client.query(checkQuery, checkValues);

//     if (checkResult.rows.length > 0) {
//       // Update the existing record with the new experience value
//       const existingExperience = checkResult.rows[0].experience_gained;
//       const newExperience = parseInt(existingExperience)+ parseInt(experienceGained);

//       const updateQuery = `
//         UPDATE "MonthlyExperience"
//         SET experience_gained = $1
//         WHERE user_id = $2 AND month = $3;
//       `;

//       const updateValues = [newExperience, userId, month];

//       await client.query(updateQuery, updateValues);
//       console.log("Record updated successfully.");
//     } else {
//       // Insert a new record with the given experience value
//       const insertQuery = `
//         INSERT INTO "MonthlyExperience" (user_id, month, experience_gained)
//         VALUES ($1, $2, $3);
//       `;

//       const insertValues = [userId, month, experienceGained];

//       await client.query(insertQuery, insertValues);
//       console.log("Record inserted successfully.");
//     }
//   } catch (err) {
//     console.error("Error executing query:", err);
//   } finally {
//     await client.end();
//   }
// }

// // // Example usage
// const userId = "2"; // Replace with the actual user ID

// let month = '2022-12-01'; // Replace with the desired month
// let experienceGained = 979; // Replace with the actual experience gained

// addOrUpdateMonthlyExperience(userId, month, experienceGained)
//   .then(() => {
//     return getUserMonthlyExperiences(userId);
//   })
//   .then(experiences => {
//     console.log("Monthly Experiences:", experiences);
//   })

//   .catch(error => {
//     console.error("Error:", error);
//   });
// for (let i = 12; i >= 1; i--) {
//   let month = `2020-${String(i).padStart(2, '0')}-01`;
//   console.log(month);

//   const min = 100;
//   const max = 999;
//   const experienceGained = Math.floor(Math.random() * (max - min + 1)) + min;
  
//   addOrUpdateMonthlyExperience(userId, month, experienceGained)
//     .then(() => {
//       return getUserMonthlyExperiences(userId);
//     })
//     .then(experiences => {
//       console.log("Monthly Experiences:", experiences);
//     })
  
//     .catch(error => {
//       console.error("Error:", error);
//     });
// }
