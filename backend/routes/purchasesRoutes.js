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
    } = req.body;

    const itemsWithImport = await Promise.all(
      items.map(async (item) => {
        const foundPhone = await Phone.findOne({ _id: item.phoneId }).lean();
        const matchedStorage = foundPhone?.storages?.find(
          (s) => s.size === item.storage
        );
        const importPrice = matchedStorage?.importPrice || 0;
        return { ...item, importPrice };
      })
    );

    // ✅ Tính phí khu vực / vận chuyển / bảo hành
    let regionFee =
      region === "Miền Nam"
        ? 10000
        : region === "Miền Trung"
        ? 20000
        : region === "Miền Bắc"
        ? 30000
        : 0;

    let methodFee =
      shippingMethod === "Giao Hàng Tiết Kiệm"
        ? 10000
        : shippingMethod === "Viettel Post"
        ? 20000
        : shippingMethod === "Giao Hàng Nhanh"
        ? 30000
        : 0;

    let warrantyFee =
      warranty === "Bảo hành vàng"
        ? 500000
        : warranty === "Bảo hành VIP"
        ? 1000000
        : 0;

    // ✅ Tạo đơn hàng (tất cả bắt đầu là waiting_approval)
    const purchase = new Purchase({
      email,
      items: itemsWithImport,
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
      status: "waiting_approval", // 🟡 mặc định chờ duyệt
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

/* ====== 📌 Duyệt đơn hàng (Admin) ====== */
router.put("/:id/approve", async (req, res) => {
  try {
    const order = await Purchase.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // ✅ Nếu là COD → chuyển sang pending
    // ✅ Nếu là Online → chuyển sang paid
    let newStatus =
      order.paymentMethod?.toUpperCase() === "COD" ? "pending" : "paid";

    order.status = newStatus;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Lỗi duyệt đơn:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});
// 📦 Lấy toàn bộ đơn hàng (cho admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Purchase.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách đơn hàng:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
