// authMiddleware.js

const passport = require('passport');

// Middleware to protect routes requiring authentication
const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = { requireAuth };
