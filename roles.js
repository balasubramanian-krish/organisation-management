const mongoose = require('mongoose');

const rolesSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  roleId: { type: Number, unique: true, required: true }
});


const Roles = mongoose.model('roles', rolesSchema);

module.exports = Roles;
