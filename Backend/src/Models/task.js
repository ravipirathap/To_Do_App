const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  priority: { 
    type: String,
     enum: ["low", "medium", "high"],
      required: true 
  },
  done: {
    type: Boolean,
    default: false
  }
});

const Task = mongoose.model("Task", userSchema);

module.exports = Task;
