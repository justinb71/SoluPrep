const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcrypt');
const jwtSecret = process.env.JWT_SECRET || 'your_secret_key_here';

const db = require('./db'); // Import your database connection

passport.use(new LocalStrategy({
  usernameField: 'email', // Adjust this if your frontend sends username
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await db.query('SELECT * FROM "public"."users" WHERE email = $1', [email]);
    if (!user) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret
}, async (jwtPayload, done) => {
  try {
    const user = await db.query('SELECT * FROM "public"."users" WHERE user_id = $1', [jwtPayload.user_id]);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;
