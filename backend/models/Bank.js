const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  logo: { type: String, required: true } // URL hoặc base64
});

module.exports = mongoose.model("Bank", bankSchema);
