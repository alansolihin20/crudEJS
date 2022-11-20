const mongoose = require('mongoose');

const User = mongoose.model('User', {
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  noHp: {
    type: String,
  },
});

module.exports = User;
