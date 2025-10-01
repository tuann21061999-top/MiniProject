const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema({
  name: String,
  brand: String,
  price: Number,
  description: String,
  image: String,

  // Màu sắc
  colors: [
    {
      name: String,   // ví dụ: "Đen"
      image: String   // ví dụ: "https://link-to-black.jpg"
    }
  ],

  // Bộ nhớ
  storages: [
    {
      size: String,      // ví dụ: "128GB"
      extraPrice: Number // giá cộng thêm so với basePrice
    }
  ],

  basePrice: Number,     // giá cơ bản

  // Pin
  battery: Number,       // dung lượng pin (mAh), ví dụ: 5000

  // SIM
  sim: String            // loại SIM: "1 SIM", "2 SIM", "eSIM"
});

module.exports = mongoose.model("Phone", phoneSchema);
