const express = require("express");
const Purchase = require("../models/Purchase");
const Address = require("../models/Address");
const router = express.Router();

/* ====== 📌 Tạo đơn hàng (checkout) ====== */
/* ====== 📌 Tạo đơn hàng (checkout) ====== */
router.post("/checkout", async (req, res) => {
  try {
    const {
      email,
      items,
      total,
      fullName,
      phone,
      shippingAddress,
      province,
      region,
      shippingMethod,
      paymentMethod,
      warranty,
      status, // 👈 nhận status từ frontend
    } = req.body;

    // ✅ Tính phí theo region / phương thức / bảo hành
    let regionFee = 0;
    if (region === "Miền Nam") regionFee = 10000;
    else if (region === "Miền Trung") regionFee = 20000;
    else if (region === "Miền Bắc") regionFee = 30000;

    let methodFee = 0;
    if (shippingMethod === "Viettel Post") methodFee = 10000;
    else if (shippingMethod === "Giao Hàng Nhanh") methodFee = 20000;

    let warrantyFee = 0;
    if (warranty === "Bảo hành vàng") warrantyFee = 500000;
    else if (warranty === "Bảo hành VIP") warrantyFee = 1000000;

    const purchase = new Purchase({
      email,
      items,
      total,
      fullName,
      phone,
      shippingAddress,
      province,
      region, // ✅ copy từ địa chỉ khi user chọn
      shippingMethod,
      paymentMethod,
      warranty,
      regionFee,
      methodFee,
      warrantyFee,
      status, // ✅ lưu trạng thái (pending cho COD, paid cho online)
    });

    await purchase.save();
    res.json({ success: true, purchase });
  } catch (err) {
    console.error("❌ Lỗi tạo đơn:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


/* ====== 📌 Lấy tất cả đơn theo email user ====== */
router.get("/user/:email", async (req, res) => {
  try {
    const orders = await Purchase.find({ email: req.params.email }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error("❌ Lỗi lấy đơn hàng:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ====== 📌 Cập nhật trạng thái đơn hàng ====== */
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Purchase.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, order: updated });
  } catch (err) {
    console.error("❌ Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* ====== 📌 Xóa đơn hàng (tuỳ chọn) ====== */
router.delete("/:id", async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xóa đơn hàng" });
  } catch (err) {
    console.error("❌ Lỗi xóa đơn:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
