const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String },
  isActive: { type: Number},
  phone: { type: String },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'roles' }]
});

// Hash password before saving to the database
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  try {
    const existingUser = await this.constructor.findOne({ email: this.email });
    if (existingUser) {
      // If user already exists, throw an error
      throw new Error('Username already exists');
    }
    next();
  } catch (error) {
    next(error);
  }
  try {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next(); 
  } catch (error) {
    return next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const match = await bcrypt.compare(candidatePassword, this.password);
    return match;
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error(error);
  }
};

const User = mongoose.model('users', userSchema);
module.exports = User;
