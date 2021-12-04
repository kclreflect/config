const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  nokiaId: { type: String, required: true },
  token: { type: String, required: true },
  refresh: { type: String, required: true }
});

module.exports = mongoose.model('user', userSchema);
