const mongoose = require("mongoose");

const pinSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pin: { type: String, required: true }, // bcrypt hash
});

module.exports = mongoose.model("Pin", pinSchema);
