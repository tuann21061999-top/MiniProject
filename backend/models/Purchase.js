const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    email: { type: String, required: true }, // email user

    // 🛍️ Thông tin sản phẩm
    items: [
      {
        name: String,
        color: String,
        storage: String,
        quantity: Number,
        price: Number,
        image: String,
      },
    ],

    // 💰 Thanh toán
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    warranty: { type: String, default: "Bảo hành thường" },

    // 🚚 Giao hàng
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    province: { type: String, required: true },
    region: {
      type: String,
      enum: ["Miền Bắc", "Miền Trung", "Miền Nam", "Khác"],
      default: "Khác",
    },
    shippingMethod: { type: String, default: "Giao Hàng Tiết Kiệm" },

    // 📦 Phí dịch vụ
    regionFee: { type: Number, default: 0 },
    methodFee: { type: Number, default: 0 },
    warrantyFee: { type: Number, default: 0 },

    // 📊 Trạng thái
    status: {
      type: String,
      enum: ["pending", "paid", "done", "unsuccessful", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
