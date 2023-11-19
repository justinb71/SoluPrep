const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Import your user model
const bcrypt = require('bcrypt');
router.use(express.urlencoded({ extended: true }));

function checkNotAuthenticated(req, res, next){
  if (req.isAuthenticated()){
      return res.redirect("/Dashboard")
  }

  next()
}
router.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('Register', {
        errorMessage: req.flash('error')
      });
});

// Route to handle registration form submission
router.post('/register', async (req, res) => {
  try {
    
    const {first_name, last_name, username, email, password, confirmPassword } = req.body;

    // Check if the passwords match
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/Register');
    }

    // Check if a user with the same email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      req.flash('error', 'A user with this email already exists');
      return res.redirect('/Register');
    }

    // Create the user using the User class
    const userId = await User.createUser(username, email, password, first_name, last_name,);

    // Redirect to login or a success page
    res.redirect('/Login');
  } catch (error) {
    console.error('Error during registration:', error);
    req.flash('error', 'An error occurred during registration');
    // Handle the error and redirect back to the registration page
    res.redirect('/Register');
  }
});

module.exports = router;
