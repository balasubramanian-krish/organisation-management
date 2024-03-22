const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./user');

passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ email: username }).then( user => {
      if (user) {
        user.comparePassword(password).then((isMatch) => {
            if (isMatch) {
              return done(null, user);
            }
            return done(null, false, { message: 'Incorrect password.' });
          }).catch((err) => {
            return done(err);
        });
      } else {
        return done(null, false, { message: 'Incorrect username.' });
      }
    }).catch(error => {
        console.error(error);
        return done(null, false, { message: 'Incorrect username.' });
    });
}));

passport.serializeUser((user, done) => {
  console.log(user.id)
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then( user => {
        return done(null, false, { message: 'Logout' });
    });
});
