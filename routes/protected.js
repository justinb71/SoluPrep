require('dotenv').config();

const express = require('express');
const passport = require('passport');
const router = express.Router();
const { Client } = require("pg");
const User = require('../models/user');
const stripe = require("stripe")(process.env.STRIPE_PRVATE_KEY)

router.use(express.json());




// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    
    return next(); 
  }
  res.redirect('/login');
};

router.get('/user/profile', isAuthenticated, (req, res) => {

  res.render('profile', { user: req.user }); 
});

router.get('/get-started', isAuthenticated, async (req, res) => {
  let user = req.user;
  personalised = await User.checkIfPersonalised(user.user_id)
  console.log(personalised)
  if (personalised){
    res.redirect("/dashboard")
  }else{
    res.render('GetStarted', { user: user, errorMessage: req.flash('error')});
  }
  
  
});

function createPrices() {
  return stripe.prices.list({ active: true, limit: 10 })
    .then(prices => {
      return stripe.products.list({ active: true, limit: 10 })
        .then(products => {
          // Create a Map of product information
          const productInfoMap = new Map(products.data.map(product => [product.id, { name: product.name, description: product.description }]));

          // Filter out prices that do not have associated product information
          const filteredPrices = prices.data.filter(price => productInfoMap.has(price.product));

          // Create the subscriptions Map with only known products
          const subscriptions = new Map(
            filteredPrices.map(price => {
              const productInfo = productInfoMap.get(price.product);

              return [price.id, {
                priceId: price.id,
                name: productInfo.name,
                description: productInfo.description
              }];
            })
          );

          return subscriptions;
        });
    })
    .catch(error => {
      console.error("Error fetching prices:", error.message);
      throw error;
    });
}
const subscriptionsPromise = createPrices();

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    let userId;
    let user;
    if (req.user && req.user.user_id) {
      userId = req.user.user_id;
      user = req.user
    } else {
      return res.json({ url: "/register" });
    }
    


    const subscriptions = await subscriptionsPromise;
    let id;
    let customer;
    try {
      // Try to retrieve the existing customer
      customer = await stripe.customers.retrieve(userId);

      // Check if the customer is deleted
      if (customer.deleted) {

        // If deleted, update the existing customer
        customer = await stripe.customers.update(userId, {
        
        name: user.first_name + " " + user.last_name,
        email: user.email
        });
      }

      
    } catch (error) {

      // Customer not found, create a new customer
      try {
        customer = await stripe.customers.create({
          id: userId,
          name: user.first_name + " " + user.last_name,
          email: user.email
          // Add other customer properties as needed
        });
      } catch (createError) {
        // Handle the case where the customer creation fails
        console.error("Error creating customer:", createError.message);
        // You might want to send an appropriate response to the client
        return res.status(500).json({ error: "Error creating customer" });
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: determineCheckoutMode(items, subscriptions),
      customer: customer.id,
      line_items: items.map(item => {
        const subscription = subscriptions.get(item.id);
        id = item.id
        return {
          price: subscription.priceId,
          quantity: item.quantity || 1,
        };
      }),
      success_url: `${process.env.SERVER_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}&subscription_id=${id}`, // Use {CHECKOUT_SESSION_ID} directly
      cancel_url: `${process.env.SERVER_URL}/pricing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    
    res.status(500).json({ err: error.message });
  }
});




function determineCheckoutMode(items, subscriptions) {
  // Check if any item corresponds to a free subscription
  const isFreeSubscription = items.some(item => {
    const subscription = subscriptions.get(item.id);
    return subscription && subscription.priceId === "price_1OORHDE0TEj3ghXuQsWhJcJN";
  });

  // Determine the mode based on whether there is a free subscription
  return isFreeSubscription ? "payment" : "subscription";
}

router.get('/pricing/success', async (req, res) => {
  try {
    // Get the session ID and price ID from the query parameters
    const { session_id, subscription_id } = req.query;
    

    // Retrieve the session to get more information if needed
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Retrieve the price to get more information if needed
    const prices = await stripe.prices.retrieve(subscription_id);
    const price = await stripe.prices.retrieve(subscription_id);

    // Now you can use the session and price objects as needed in your success page logic

    const customer = await stripe.customers.retrieve(session.customer);
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
    });
  
    let plan = subscriptions.data[0].plan;
    const userId = customer.id

    if (plan.active = true){
      let subscriptionLevel = 1
      if(plan.id == "price_1OONE2E0TEj3ghXu0bSGXKGv"){ subscriptionLevel = 2 }
      else if(plan.id == "price_1OONH1E0TEj3ghXuutoqvAAg"){subscriptionLevel = 3 };

      const client = new Client(process.env.DATABASE_URL);
      try {
        await client.connect();
    
        const query = 'UPDATE public.users SET subscription_level = $1 WHERE user_id = $2 RETURNING *';
        const result = await client.query(query, [subscriptionLevel, userId]);
    
        if (result.rowCount === 0) {
          console.log(`No user found with user_id: ${userId}`);
          return null; // or throw an error if you want to handle this case differently
        }
    
        const updatedUser = result.rows[0];
        console.log('User updated:', updatedUser);
        res.render('Pricing/Success', { session, price, customer });
        return updatedUser;
      } catch (err) {
        console.error('Error updating user:', err);
        throw err; // handle the error appropriately
      } finally {
        await client.end();
      }
    
    }

    
  } catch (error) {
    // Handle errors
    console.error('Error retrieving data:', error);

    // Send a meaningful error response to the client
    res.status(500).send(`Error retrieving data: ${error.message || 'Unknown error'}`);
  }
});


router.get('/dashboard', isAuthenticated, async (req, res) => {
  let user = req.user;
  try{
    const customer = await stripe.customers.retrieve(user.user_id);
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
    });
    let plan = subscriptions.data[0].plan;
  
    if (plan.active = true){
      getExperienceGainedThisMonth(user.user_id)
      .then(experienceGained => {
        user["this-months-experience"] = experienceGained;
        user["averagescore "] = user["averagescore "] * 100;
        res.render('Dashboard', { user: user });
      })
      .catch(error => {
        console.error('Error:', error);
        user["averagescore "] = user["averagescore "] * 100;
        user["this-months-experience"] = 0;
        res.render('Dashboard', { user: user });
      });
    }else{
      getExperienceGainedThisMonth(user.user_id)
      .then(experienceGained => {
        user["this-months-experience"] = experienceGained;
        user["averagescore "] = user["averagescore "] * 100;
        res.render('Dashboard', { user: user });
      })
      .catch(error => {
        console.error('Error:', error);
        user["averagescore "] = user["averagescore "] * 100;
        user["this-months-experience"] = 0;
        res.render('Dashboard', { user: user });
      });
    }
  }catch(e){
    getExperienceGainedThisMonth(user.user_id)
      .then(experienceGained => {
        user["this-months-experience"] = experienceGained;
        user["averagescore "] = user["averagescore "] * 100;
        res.render('Dashboard', { user: user });
      })
      .catch(error => {
        console.error('Error:', error);
        user["averagescore "] = user["averagescore "] * 100;
        user["this-months-experience"] = 0;
        res.render('Dashboard', { user: user });
      });
  };
  

  
  
});






router.get('/user/quizzes', isAuthenticated, (req, res) => {

  res.render('Quizzes', { user: req.user }); 
});

router.get('/user/quizzes/create', isAuthenticated, (req, res) => {

  res.render('Quizzes/Create', { user: req.user }); 
});


router.get('/user/quizzes/quiz', isAuthenticated, (req, res) => {

  res.render('Quizzes/Quiz', { user: req.user }); 
});


router.get('/user/exams', isAuthenticated, (req, res) => {

  res.render('Exams', { user: req.user }); 
});

router.get('/user/exams/create', isAuthenticated, (req, res) => {

  res.render('Exams/Create', { user: req.user }); 
});


router.get('/user/exams/quiz', isAuthenticated, (req, res) => {

  res.render('Exams/Quiz', { user: req.user }); 
});

router.post('/getuser', isAuthenticated, (req, res) => {

  res.json(req.user);
});



router.get('/logout', isAuthenticated, (req, res) => {
  req.logout(() => {
    res.clearCookie('rememberMe');
    
    // Destroy the session
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/login');
    });
  });
});


router.get("/user/getTopics", isAuthenticated, async (req, res) => {
  try {
    const subject = req.query.subject;
    const topics = await getTopicsForSubject(subject);
    res.json(topics);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


async function getTopicsForSubject(userId) {
  const client = new Client(process.env.DATABASE_URL);
  try {
    await client.connect();

    const query = 'SELECT topic_list FROM subjects WHERE subject_name = $1';
    const result = await client.query(query, [subjectName]);

    if (result.rowCount === 0) {
      console.log(`No topics found for subject: ${subjectName}`);
      return [];
    }

    const topics = result.rows[0].topic_list;
    return topics;
  } catch (err) {
    console.error('Error:', err);
    return [];
  } finally {
    await client.end();
  }
}

async function getExperienceGainedThisMonth(userId) {
  const client = new Client(process.env.DATABASE_URL);
  try {
    await client.connect();

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = '01'; // First day of the month
    const currentMonth = `${year}-${month}-${day}`;

    const query = 'SELECT experience_gained FROM "MonthlyExperience" WHERE user_id = $1 AND month = $2';
    const result = await client.query(query, [userId, currentMonth]);

    if (result.rowCount === 0) {
      // No record found for this month, let's create one with experience_gained set to 0
      const insertQuery = 'INSERT INTO "MonthlyExperience" (user_id, month, experience_gained) VALUES ($1, $2, 0) RETURNING experience_gained';
      const insertResult = await client.query(insertQuery, [userId, currentMonth]);
      return 0; // Return 0 as the experience gained for the new record
    }

    const experienceGained = result.rows[0].experience_gained;
    return experienceGained;
  } catch (err) {
    console.error('Error:', err);
    return 0;
  } finally {
    await client.end();
  }
}




async function getTopicsForSubject(subjectName) {
  const client = new Client(process.env.DATABASE_URL);
  try {
    await client.connect();

    const query = 'SELECT topic_list FROM subjects WHERE subject_name = $1';
    const result = await client.query(query, [subjectName]);

    if (result.rowCount === 0) {
      console.log(`No topics found for subject: ${subjectName}`);
      return [];
    }

    const topics = result.rows[0].topic_list;
    return topics;
  } catch (err) {
    console.error('Error:', err);
    return [];
  } finally {
    await client.end();
  }
}


router.get("/user/getSubjects", isAuthenticated, async (req, res) => {
  try {
    const subjects = await getAllSubjects();
    res.json(subjects);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


async function getAllSubjects() {
  const client = new Client(process.env.DATABASE_URL);
  try {
    await client.connect();

    const query = 'SELECT subject_name FROM subjects';
    const result = await client.query(query);

    const subjects = result.rows.map(row => row.subject_name);
    return subjects;
  } catch (err) {
    console.error('Error:', err);
    return [];
  } finally {
    await client.end();
  }
}


// Function to get user's monthly experiences
async function getUserMonthlyExperiences(userId) {
  const client = new Client(process.env.DATABASE_URL);
  try {
    await client.connect();

    const query = `
      SELECT date_trunc('month', month) AS month_start, SUM(experience_gained) AS total_experience
      FROM "MonthlyExperience"
      WHERE user_id = $1
      GROUP BY date_trunc('month', month)
      ORDER BY date_trunc('month', month);
    `;

    const values = [userId];

    const result = await client.query(query, values);
    
    return result.rows;
  } catch (err) {
    console.error("Error querying database:", err);
    return [];
  } finally {
    await client.end();
  }
}

async function getQuestionsGenerated(userId) {
  const client = new Client(process.env.DATABASE_URL);
  try {
    await client.connect();


    const query = `
      SELECT questions_generated
      FROM "users"
      WHERE user_id = $1
    `;

    const values = [userId];

    const result = await client.query(query, values);

    return result.rows;
  } catch (err) {
    console.error("Error querying database:", err);
    return [];
  } finally {
    await client.end();
  }
}

// Function to add or update monthly experience
async function addOrUpdateMonthlyExperience(userId, month, experienceGained) {
  const client = new Client(process.env.DATABASE_URL);
  try {
    await client.connect();

    // Check if a record already exists for the given month and user
    const checkQuery = `
      SELECT experience_gained
      FROM "MonthlyExperience"
      WHERE user_id = $1 AND month = $2;
    `;

    const checkValues = [userId, month];

    const checkResult = await client.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      // Update the existing record with the new experience value
      const existingExperience = checkResult.rows[0].experience_gained;
      const newExperience = parseInt(existingExperience)+ parseInt(experienceGained);

      const updateQuery = `
        UPDATE "MonthlyExperience"
        SET experience_gained = $1
        WHERE user_id = $2 AND month = $3;
      `;

      const updateValues = [newExperience, userId, month];

      await client.query(updateQuery, updateValues);
      
    } else {
      // Insert a new record with the given experience value
      const insertQuery = `
        INSERT INTO "MonthlyExperience" (user_id, month, experience_gained)
        VALUES ($1, $2, $3);
      `;

      const insertValues = [userId, month, experienceGained];

      await client.query(insertQuery, insertValues);
      
    }
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}


router.get('/user/:userId/monthly-experiences',isAuthenticated, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const experiences = await getUserMonthlyExperiences(userId);
    res.json(experiences);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

router.get('/user/:userId/questions-generated',isAuthenticated, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const experiences = await getQuestionsGenerated(userId);
    res.json(experiences);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

router.post('/user/:userId/monthly-experiences',isAuthenticated, async (req, res) => {
  const userId = req.user.userId;
  const { month, experienceGained } = req.body;

  try {
    await addOrUpdateMonthlyExperience(userId, month, experienceGained);
    res.json({ message: "Monthly experience added/updated successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

router.get("/user/quizzes/get-questions", isAuthenticated, async (req, res) => {
  try {
    const quizID = req.query.quizID;
    const questions = await getQuizQuestions(quizID);
    const quizName = await getQuizName(quizID);

    res.status(200).json({ generatedQuestions: questions, quizName: quizName});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/user/generateQuiz", isAuthenticated, async (req, res) => {
  const questions = req.body.questions;
  const quizName = req.body.quizName;

  try {
    const generatedQuestions = await Promise.all(
      Object.values(questions).map(async (question) => {
        const generatedQuestion = await generateQuestion(question);
        return generatedQuestion;
      })
    );

    // Create a new quiz and get the quiz ID
  createQuiz(req.user.user_id,quizName)
  .then(async quizID=>{

    // Create and associate questions with the generated quiz
    await Promise.all(
      
      Object.values(generatedQuestions).map(async (question) => {
       
        const questionId = await createQuestion(req.user.user_id, question);
        await createQuizQuestion(quizID,questionId)
        
      })
    );
    res.status(200).json({ "quizID": quizID });
  })

    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

router.delete("/user/quizzes/delete-quiz/:quizId", isAuthenticated, async (req, res) => {
  const quiz_id = req.params.quizId;
  const userId = req.user.user_id;
  

  deleteQuiz(userId, quiz_id)
  .then(deletedQuiz => res.status(200).json({ message: 'Quiz deleted successfully', deletedQuiz }))
  .catch(error => res.status(500).json({ error: 'An error occurred' }));
  
  

})

async function createPaper(userId) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Insert a new record with the given user_id and creation_date
    const insertQuery = `
      INSERT INTO "exampapers" (user_id, creation_date)
      VALUES ($1, $2)
      RETURNING paper_id;
    `;

    const insertValues = [userId, new Date()];

    const result = await client.query(insertQuery, insertValues);

    // The generated paper_id is returned as part of the result
    const paperId = result.rows[0].paper_id;
    return paperId;
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}




async function generateQuestion(question) {
  let qType = "";
  if (question.type === "Multiple Choice") {
    qType = "generate_multiple_choice";
  } else if (question.type === "Short") {
    qType = "generate_short_answer";
  } else if (question.type === "Long") {
    qType = "generate_long_answer";
  }

  try {
    const response = await fetch('http://77.68.52.72:8000/' + qType, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "amountOfQuestions": 1,
        "subject": question.subject,
        "topics": question.topic,
        "difficulty": question.difficulty,
        "level": question.level
      })
    });


    if (response.ok) {
      const responseData = await response.json();
      const result = responseData.result; // Parse the result string to JSON

      return result;
    } else {
      // Handle error, throw an exception or return an appropriate value
      console.error('Error:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}


async function createQuiz(userId,quizName) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Insert a new record with the given user_id and creation_date
    const insertQuery = `
      INSERT INTO "quizzes" (user_id, quiz_name)
      VALUES ($1, $2)
      RETURNING quiz_id;
    `;

    const insertValues = [userId, quizName];

    const result = await client.query(insertQuery, insertValues);

    // The generated paper_id is returned as part of the result
    const quiz_id = result.rows[0].quiz_id;
    return quiz_id;
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

async function createQuestion(userId,questionData) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Insert a new record with the given user_id and creation_date
    const insertQuery = `
      INSERT INTO "questions" (user_id, question)
      VALUES ($1, $2)
      RETURNING question_id;
    `;

    const insertValues = [userId, questionData];

    const result = await client.query(insertQuery, insertValues);

    try {  
      // Insert a new record with the given user_id and creation_date
      const insertQuery = `
      UPDATE users
      SET questions_generated = questions_generated + 1
      WHERE user_id = ($1);
      
      `;
      const insertValues = [userId];
      await client.query(insertQuery, insertValues);
  
    } catch (err) {
      console.error("Error executing query:", err);
    } finally {
      await client.end();
    }t
    const question_id = result.rows[0].question_id;
    return question_id;
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

async function createQuizQuestion(quizId,questionId) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const insertQuery = `
      INSERT INTO "quizquestions" (quiz_id, question_id)
      VALUES ($1, $2)
    `;

    const insertValues = [quizId, questionId];

    await client.query(insertQuery, insertValues);

  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

async function getQuizQuestions(quizId) {
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const selectQuery = `
      SELECT q.question_id, q.question, q.attempts
      FROM public.questions q
      INNER JOIN public.quizquestions qq ON q.question_id = qq.question_id
      WHERE qq.quiz_id = $1
    `;
    
    const { rows } = await client.query(selectQuery, [quizId]);
    
    return rows;
  } catch (err) {
    console.error("Error executing query:", err);
    throw err;
  } finally {
    await client.end();
  }
}

async function getQuizName(quizId) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const selectQuery = `
      SELECT quiz_name
      FROM public.quizzes
      WHERE quiz_id = $1
    `;
    
    const { rows } = await client.query(selectQuery, [quizId]);
    
    return rows;
  } catch (err) {
    console.error("Error executing query:", err);
    throw err;
  } finally {
    await client.end();
  }
}


router.get("/user/quiz/get-quizzes", isAuthenticated, async (req,res) =>{
  try{
    let quizzes = await getQuizzes(req.user.user_id);

    res.status(200).json({"quizzes": quizzes})
  }
  catch{
    res.status(500)

  }
})


async function getQuizzes(userId) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const selectQuery = `
      SELECT DISTINCT ON (q.quiz_id)
        q.quiz_id,
        q.user_id AS quiz_owner_id,
        q.quiz_name,
        q.creation_date AS quiz_creation_date,
        a.attempt_id,
        a.user_id AS attempt_user_id,
        a.attempt_date,
        a.score
      FROM
        public.quizzes q
      LEFT JOIN
        public.attempts a ON q.quiz_id = a.quiz_id
      WHERE
        q.user_id = $1
      ORDER BY
        q.quiz_id, a.attempt_date DESC;
    `;

    const { rows } = await client.query(selectQuery, [userId]);

    return rows;
  } catch (err) {
    console.error("Error executing query:", err);
    throw err;
  } finally {
    await client.end();
  }
}

async function deleteQuiz(userId,quizId) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log(quizId)
    // Delete the quiz and check ownership
    const deleteQuizQuery = 'DELETE FROM public.quizzes WHERE quiz_id = $1 AND user_id = $2';
    const result = await client.query(deleteQuizQuery, [quizId, userId]);
    console.log('Rows affected:', result.rowCount);

  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    // Close the database connection
    await client.end();
  }
}


module.exports = router;
