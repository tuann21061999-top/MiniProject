const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  phoneId: { type: String, required: true },
  phoneName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true }, // ✅ BẮT BUỘC field này ở cấp root
  comments: {
    type: Object,
    default: {},
  },
});

module.exports = mongoose.model("Review", reviewSchema);
