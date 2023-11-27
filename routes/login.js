const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));


function checkNotAuthenticated(req, res, next){
  if (req.isAuthenticated()){
      return res.redirect("/dashboard")
  }

  next()
}

// Route to render the login page
router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('Login', {
    errorMessage: req.flash('error')
  });
});



// Route to handle login form submission
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

module.exports = router;
