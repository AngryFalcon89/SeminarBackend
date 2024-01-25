const { default: mongoose } = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    username: String,
    password: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
