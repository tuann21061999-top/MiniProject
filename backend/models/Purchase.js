const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema({
  email: { type: String, required: true },
  items: [
    {
      phoneId: String,
      name: String,
      color: String,
      storage: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "paid", "done", "unsuccessful", "cancelled"], 
    default: "pending" 
  },
  shippingAddress: { type: String },
  province: { type: String },
  region: { type: String },
  phone: { type: String },
  shippingMethod: { type: String },
  paymentMethod: { type: String },
  voucher: { type: String },
  warranty: { type: String },
  cancelReason: { type: String },   // ✅ lưu lý do hủy
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Purchase", PurchaseSchema);
