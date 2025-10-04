const mongoose = require("mongoose");

const PayMethodSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // liên kết User
    type: { type: String, required: true },           // loại phương thức: VISA, MOMO, PAYPAL...
    provider: { type: String, required: true },       // tên nhà cung cấp: Vietcombank, BIDV...
    accountNumber: { type: String, required: true },  // số tài khoản / số thẻ
    expiry: { type: String },                         // ngày hết hạn (MM/YY hoặc MM/YYYY)
    isDefault: { type: Boolean, default: false },     // có phải mặc định hay không
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayMethod", PayMethodSchema);
