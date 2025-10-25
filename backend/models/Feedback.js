const mongoose = require("mongoose");

// 🧩 Định nghĩa schema cho feedback
const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// ⚙️ Tạo model và export
module.exports = mongoose.model("Feedback", feedbackSchema);
