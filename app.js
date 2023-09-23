const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('express-flash');
const path = require('path');
const User = require('./models/user');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'css')));
app.use(express.static(path.join(__dirname, 'public', 'js')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
  }
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.user_id);
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

    if (!user || !(await User.verifyPassword(user, password))) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Routes
app.get('/', (req, res) => {
  res.render('LandingPage');
});

app.get('/pricing', (req, res) => {
  res.render('Pricing');
});

app.get('/about', (req, res) => {
  res.render('About');
});

const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const protectedRoutes = require('./routes/protected');

app.use(loginRoutes);
app.use(registerRoutes);
app.use(protectedRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
