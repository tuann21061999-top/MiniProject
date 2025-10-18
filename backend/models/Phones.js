const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema({
  name: String,
  brand: String,
  price: Number,
  description: String,
  image: String,

  colors: [
    {
      name: String,
      image: String,
    },
  ],
  storages: [
    {
      size: String,
      extraPrice: Number,
      importPrice: Number,
    },
  ],

  basePrice: Number,
  importPrice: Number,
  battery: Number,
  sim: String,

  specs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Specs",
  },
});

module.exports = mongoose.model("Phone", phoneSchema);
