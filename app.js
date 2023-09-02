const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const path = require('path');
const session = require('express-session'); // Import express-session
const flash = require('express-flash'); 
const User = require('./models/user.js'); // Adjust the path based on your project structure
require('dotenv').config();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(express.static('css'));
app.use(express.static('js'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
  }
}));

app.use(flash());

require('dotenv').config();


app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.user_id); // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    const isPasswordValid = await User.verifyPassword(user, password); // Corrected line

    if (!isPasswordValid) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));


// Set up other passport and JWT configurations

// Include your login and authentication routes
const loginRoutes = require('./routes/login');
// const authRoutes = require('./routes/auth');
const registerRoutes = require('./routes/register');
const protectedRoutes = require('./routes/protected');

app.use(loginRoutes);
app.use(registerRoutes);
app.use(protectedRoutes);


app.get('/', (req, res) => {
  res.render('\LandingPage');
});
app.get('/pricing', (req, res) => {
  res.render('\Pricing');
});

app.get('/about', (req, res) => {
  res.render('\About');
});
// ... other routes and configurations ...

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
