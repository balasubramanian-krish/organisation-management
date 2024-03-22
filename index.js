const express = require('express');
const session = require('express-session');
const passport = require('passport');
const db = require('./dbconnection');
const authRoutes = require('./auth-routes');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./passport-config');

const app = express();
app.use(session({
  secret: '123456',
  resave: false,
  saveUninitialized: false,
  cookie:{secure:false}
}));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

db.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
});
