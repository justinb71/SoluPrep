const express = require('express');
const passport = require('./auth'); // Adjust the path to your auth.js file

const router = express.Router();

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  // This route is protected by JWT authentication
  // req.user contains the authenticated user
  res.json({ message: 'Protected route accessed.' });
});

module.exports = router;
