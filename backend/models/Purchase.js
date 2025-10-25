const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },

    items: [
      {
        phoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Phone" },
        name: String,
        color: String,
        storage: String,
        quantity: Number,
        price: Number,
        importPrice: Number,
        image: String,
      },
    ],

    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    warranty: { type: String, default: "Bảo hành thường" },

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

    regionFee: { type: Number, default: 0 },
    methodFee: { type: Number, default: 0 },
    warrantyFee: { type: Number, default: 0 },

    // 📊 Trạng thái
    status: {
      type: String,
      enum: [
        "waiting_approval", // 🟡 Chờ admin duyệt
        "pending",           // COD đã duyệt, đang giao
        "paid",              // Online đã duyệt, đang giao
        "done",              // Hoàn tất
        "unsuccessful",      // Giao không thành công
        "cancelled",         // Hủy
      ],
      default: "waiting_approval",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
