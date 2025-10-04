const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true }, // ✅ biết tài khoản nào tạo

    fullName: { type: String, default: "Người nhận" },
    phone: { type: String, required: true },
    province: { type: String, required: true }, // ✅ chỉ lưu tỉnh
    street: { type: String, required: true },   // ✅ địa chỉ cụ thể (số nhà, tên đường)

    region: {
      type: String,
      enum: ["Miền Bắc", "Miền Trung", "Miền Nam", "Khác"],
      default: "Khác",
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
