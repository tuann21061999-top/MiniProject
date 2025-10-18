const express = require("express");
const Purchase = require("../models/Purchase");
const Phone = require("../models/Phones"); // ✅ thêm dòng này
const Address = require("../models/Address");
const router = express.Router();

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
      status,
    } = req.body;

    const itemsWithImport = await Promise.all(
      items.map(async (item) => {
        const foundPhone = await Phone.findOne({ _id: item.phoneId }).lean();

        // ✅ Tìm đúng phiên bản bộ nhớ đã chọn
        const matchedStorage = foundPhone?.storages?.find(
          (s) => s.size === item.storage
        );

        const importPrice = matchedStorage?.importPrice || 0;

        return {
          ...item,
          importPrice, // ✅ lưu đúng giá nhập của phiên bản
        };
      })
);


    // ✅ Tính phí khu vực / phương thức / bảo hành
    let regionFee = 0;
    if (region === "Miền Nam") regionFee = 10000;
    else if (region === "Miền Trung") regionFee = 20000;
    else if (region === "Miền Bắc") regionFee = 30000;

    let methodFee = 0;
    if (shippingMethod === "Giao Hàng Tiết Kiệm") methodFee = 10000;
    else if (shippingMethod === "Viettel Post") methodFee = 20000;
    else if (shippingMethod === "Giao Hàng Nhanh") methodFee = 30000;

    let warrantyFee = 0;
    if (warranty === "Bảo hành vàng") warrantyFee = 500000;
    else if (warranty === "Bảo hành VIP") warrantyFee = 1000000;

    // ✅ Tạo đơn hàng
    const purchase = new Purchase({
      email,
      items: itemsWithImport, // ✅ dùng dữ liệu đã có importPrice
      total,
      fullName,
      phone,
      shippingAddress,
      province,
      region,
      shippingMethod,
      paymentMethod,
      warranty,
      regionFee,
      methodFee,
      warrantyFee,
      status,
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
