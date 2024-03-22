const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('./user');
const Roles = require('./roles');
const bcrypt = require('bcrypt');

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

router.post('/login', passport.authenticate('local'), (req, res) => {
  let response = JSON.stringify(req.user) ;
  let jsonObj = JSON.parse(response);
  let roleId =   jsonObj.roles[0];
  let roles;
  Roles.findById(roleId).then( role => {
    let responseObj = {
      "email":jsonObj.email,
      "isActive":jsonObj.isActive,
      "name":jsonObj.name,
      "message":"Logged in Successfully",
      "roleName": role.name,
      "roleId": role.roleId
    }
    req.session.loggedIn  = true;
    res.send(responseObj);
  });
 
});

router.get('/users', async (req, res) => {
  try {
    
    User.find({},'email name isActive roles').populate('roles').then(users => {
      if(users.length === 0) {
        res.status(404).send('No Users Found');
      }
      res.send(users);
    });
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    User.findOne({_id: userId},'email name isActive roles phone').then(user => {
      res.send(user);
    });
  } catch (error) {
    res.status(500).send('User Not Found');
  }
});

router.get('/roles', async (req, res) => {
  try {
    
    Roles.find({}).then(roles => {
      if(roles.length === 0) {
        res.status(404).send('No Roles Found');
      }
      res.send(roles);
    });
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

router.post('/users', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const user = new User({ email, password, name, phone });
    user.isActive = 1;
    user.roles = [req.body.roles];
    user.save().then(user=> {
      res.send('Registration successful');
    }).catch(error=> {
      res.status(500).send('Error registering user');
    })
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

router.put('/users', async (req, res) => {
  try {
    const { email, name, phone, id } = req.body;
    const update = {
      $set: {
        name: name,
        email: email,
        phone: phone,
        roles: [req.body.roles]
      }
    };
    const options = { new: true };
    User.findByIdAndUpdate(id, update, options).then(updatedUser => {
      if (updatedUser) {
        res.send('Updated successfully');
      } else {
        res.status(500).send('Error updating user');
      }
    })
  .catch(error => {
    res.status(500).send('Error updating user');
  });
  } catch (error) {
    res.status(500).send('Error updating user');
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    User.findByIdAndDelete(userId).then(deletedUser => {
      if (deletedUser) {
        res.send('Updated successfully');
      } else {
        res.status(500).send('Error deleting user');
      }
    })
    .catch(error => {
      res.status(500).send('Error deleting user');
    });
  } catch (error) {
    res.status(500).send('Error deleting user');
  }
});

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.send('Logout successful');
    });
});

module.exports = router;
