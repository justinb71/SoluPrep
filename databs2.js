

const subjectsAndTopics = {
  "Physics":[
    "Mechanics",
    "Kinematics",
    "Dynamics",
    "Forces",
    "Energy, Work, and Power",
    "Circular Motion",
    "Momentum and Impulse",
    "Materials",
    "Elasticity",
    "Stress and Strain",
    "Waves",
    "Wave Characteristics",
    "Sound Waves",
    "Light Waves",
    "Electromagnetic Waves",
    "Superposition",
    "Interference",
    "Diffraction",
    "Quantum Physics",
    "Photoelectric Effect",
    "Wave-Particle Duality",
    "Atomic Physics",
    "Nuclear Physics",
    "Particle Physics",
    "Thermodynamics",
    "Temperature and Heat",
    "Thermal Properties of Matter",
    "Thermal Processes",
    "Ideal Gases",
    "First and Second Laws of Thermodynamics",
    "Electricity",
    "Electric Fields",
    "Coulomb's Law",
    "Capacitance",
    "Current and Resistance",
    "DC Circuits",
    "Magnetic Fields",
    "Electromagnetic Induction",
    "Alternating Currents",
    "Quantum Mechanics",
    "Quantization of Energy",
    "Wavefunctions",
    "Heisenberg's Uncertainty Principle",
    "Particle Physics",
    "Particle Interactions",
    "Fundamental Particles",
    "Radioactivity",
    "Nuclear Reactions",
    "Nuclear Decay",
    "Medical Physics",
    "X-rays and Imaging",
    "Radiotherapy",
    "Astrophysics",
    "Stellar Evolution",
    "Cosmology",
    "Special and General Relativity",
    "Gravitation",
    "Quantum Field Theory",
    "Electromagnetic Theory",
    "Maxwell's Equations",
    "Electromagnetic Waves",
    "Optics",
    "Geometrical Optics",
    "Physical Optics",
    "Polarization",
    "Electronics",
    "Semiconductors",
    "Diodes and Transistors",
    "Digital Circuits",
    "Communication Systems",
    "Mechanical Properties of Matter",
    "Fluid Mechanics",
    "Surface Tension",
    "Viscosity",
    "Stress and Strain",
    "Young's Modulus",
    "Engineering Physics",
    "Mechanical Engineering Principles",
    "Civil Engineering Principles",
    "Thermodynamics in Engineering",
    "Environmental Physics",
    "Climate Change",
    "Renewable Energy",
    "Quantum Electrodynamics",
    "Quantum Chromodynamics",
    "Particle Accelerators",
    "Nuclear Fusion and Fission",
    "Dark Matter and Dark Energy",
    "String Theory and Beyond",
    "Computational Physics",
    "Numerical Methods",
    "Simulations in Physics",
    "Mathematical Techniques for Physics",
]
}

const { Client } = require('pg');
require('dotenv').config();

const client = new Client(process.env.DATABASE_URL);

async function createTableAndInsertData(data) {
  try {
    await client.connect();

    // Create the table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        subject_name VARCHAR(255) NOT NULL,
        topic_list JSONB
      );
    `);

    // Loop through the JSON object and insert data into the table
    for (const [subject, topics] of Object.entries(data)) {
      await client.query(
        'INSERT INTO subjects (subject_name, topic_list) VALUES ($1, $2)',
        [subject, JSON.stringify(topics)]
      );
    }

    console.log('Data inserted successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

// createTableAndInsertData(subjectsAndTopics)

// async function getTopicsForSubject(subjectName) {
//   try {
//     await client.connect();

//     const query = 'SELECT topic_list FROM subjects WHERE subject_name = $1';
//     const result = await client.query(query, [subjectName]);

//     if (result.rowCount === 0) {
//       console.log(`No topics found for subject: ${subjectName}`);
//       return [];
//     }

//     const topics = result.rows[0].topic_list;
//     return topics;
//   } catch (err) {
//     console.error('Error:', err);
//     return [];
//   } finally {
//     await client.end();
//   }
// }

// (async () => {
//   const subjectName = 'Physics'; // Replace with the subject you want to search
//   const topics = await getTopicsForSubject(subjectName);

//   if (topics.length > 0) {
//     console.log(`Topics for ${subjectName}:`, topics);
//   }
// })();



// async function getAllSubjects() {
//   try {
//     await client.connect();

//     const query = 'SELECT subject_name FROM subjects';
//     const result = await client.query(query);

//     const subjects = result.rows.map(row => row.subject_name);
//     return subjects;
//   } catch (err) {
//     console.error('Error:', err);
//     return [];
//   } finally {
//     await client.end();
//   }
// }

// (async () => {
//   const subjects = await getAllSubjects();

//   if (subjects.length > 0) {
//     console.log('All subjects:', subjects);
//   }
// })();






