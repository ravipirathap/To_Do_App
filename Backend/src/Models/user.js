const mongoose = require("mongoose");
const validator = require("validator");
const Role = require("./role");

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
  },
 
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  tasks: [
    { type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  ]
});

const User = mongoose.model("User", userSchema);

module.exports = User;
