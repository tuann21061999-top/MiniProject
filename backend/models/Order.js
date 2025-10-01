const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    items: [
      {
        phoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Phone", required: true },
        name: { type: String, required: true },
        color: { type: String },
        storage: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1, min: 1 },
        image: { type: String }, // ✅ thêm image
      },
    ],
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  this.total = this.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  next();
});

module.exports = mongoose.model("Order", orderSchema);
