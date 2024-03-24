const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('./user');
const Roles = require('./roles');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const authorization = (req, res, next) => {
  const token = req.cookies.token;
  console.log(token);
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, "TOP_SECRET");
    return next();
  } catch {
    return res.sendStatus(403);
  }
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
    const token = jwt.sign(responseObj, "TOP_SECRET");
    res.cookie('token', token, {expires: new Date(Date.now() + 9999999), httpOnly: false});
    return res
    .status(200)
    .json(responseObj);
  });
 
});

router.get('/users', authorization,  async (req, res) => {
  try {
    await User.find({isActive: 1},'email name isActive roles').populate('roles').then(users => {
      res.send(users);
    }).catch(error=> {
        res.status(404).send('No Users Found');
    })
  } catch (error) {

    res.status(500).send('Error registering user');
  }
});

router.get('/users/:id', authorization, async (req, res) => {
  try {
    const userId = req.params.id;
    User.findOne({_id: userId},'email name isActive roles phone').then(user => {
      res.send(user);
    })
  } catch (error) {
    res.status(500).send('User Not Found');
  }
});

router.get('/roles', authorization, async (req, res) => {
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

router.post('/users', authorization, async (req, res) => {
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

router.put('/users', authorization, async (req, res) => {
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

router.delete('/users/:id', authorization,  async (req, res) => {
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
  return res
  .clearCookie("token")
  .status(200)
  .json({ message: "Successfully logged out" });
});

module.exports = router;
