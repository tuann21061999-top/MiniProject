const mongoose = require("mongoose");

const specsSchema = new mongoose.Schema({
  os: String,
  language: String,
  screen: { type: Map, of: String },
  camera: { type: Map, of: String },
  cpu: { type: Map, of: String },
  memory: { type: Map, of: String },
  design: { type: Map, of: String },
  battery: { type: Map, of: String },
  connectivity: { type: Map, of: String },
  entertainment: { type: Map, of: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Specs", specsSchema);
