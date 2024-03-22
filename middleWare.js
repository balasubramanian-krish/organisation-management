// Example route that requires authentication
const express = require('express');
const router = express.Router();
const { requireAuth } = require('./authMiddleware');

router.get('/protected-route', requireAuth, (req, res) => {
  res.send('Protected route accessed successfully');
});

module.exports = router;
