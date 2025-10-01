const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase.js");
const Phone = require("../models/Phones.js");

// 📌 Tạo đơn hàng mới
router.post("/checkout", async (req, res) => {
  try {
    let { email, items, total, shippingAddress, paymentMethod, voucher, warranty } = req.body;

    if (!paymentMethod) paymentMethod = "COD";

    // ✅ Xác định trạng thái theo phương thức thanh toán
    let status = "pending"; 
    const onlineMethods = ["VISA", "MASTERCARD", "BANK", "MOMO", "ZALOPAY", "PAYPAL"];
    if (onlineMethods.includes(paymentMethod.toUpperCase())) {
      status = "paid";
    }

    // ✅ Gắn ảnh sản phẩm
    const itemsWithImage = await Promise.all(
      items.map(async (item) => {
        try {
          const phone = await Phone.findById(item.phoneId);
          if (phone) {
            const colorData = phone.colors?.find((c) => c.name === item.color);
            return {
              ...item,
              image: colorData?.image || phone.image || "https://via.placeholder.com/80",
            };
          }
          return { ...item, image: "https://via.placeholder.com/80" };
        } catch (err) {
          console.error("❌ Lỗi lấy ảnh cho item:", err);
          return { ...item, image: "https://via.placeholder.com/80" };
        }
      })
    );

    const newPurchase = new Purchase({
      email,
      items: itemsWithImage,
      total,
      shippingAddress,
      paymentMethod,
      voucher,
      warranty,
      status,
    });

    await newPurchase.save();
    res.json({ success: true, purchaseId: newPurchase._id, status });
  } catch (err) {
    console.error("❌ Purchase error:", err);
    res.status(500).json({ success: false, message: "Purchase failed" });
  }
});

// 📌 Cập nhật đơn hàng (bao gồm status nếu truyền vào)
router.put("/:id", async (req, res) => {
  try {
    const { 
      shippingAddress, province, region, phone,
      warranty, shippingMethod, paymentMethod, total, status
    } = req.body;

    let finalStatus = status;

    // ✅ Nếu không gửi status nhưng có paymentMethod => tự set
    if (!status && paymentMethod) {
      const onlineMethods = ["VISA", "MASTERCARD", "BANK", "MOMO", "ZALOPAY", "PAYPAL"];
      finalStatus = onlineMethods.includes(paymentMethod.toUpperCase()) ? "paid" : "pending";
    }

    const updated = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        shippingAddress,
        province,
        region,
        phone,
        warranty,
        shippingMethod,
        paymentMethod,
        total,
        ...(finalStatus && { status: finalStatus }), // chỉ set nếu có
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Purchase not found" });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating purchase:", err);
    res.status(500).json({ success: false, message: "Error updating purchase" });
  }
});

// 📌 Cập nhật trạng thái đơn hàng (done / unsuccessful / cancelled)
router.put("/:id/status", async (req, res) => {
  try {
    const { status, cancelReason } = req.body;

    const validStatuses = Purchase.schema.path("status").enumValues;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updateData = { status };
    if (status === "cancelled" && cancelReason) {
      updateData.cancelReason = cancelReason;
    }

    const updated = await Purchase.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }

    res.json({ success: true, updated });
  } catch (err) {
    console.error("❌ Error updating purchase status:", err);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
});

// 📌 Lấy danh sách đơn hàng theo email
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const purchases = await Purchase.find({ email }).sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách đơn hàng:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy đơn hàng" });
  }
});

// 📌 Lấy chi tiết 1 đơn
router.get("/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });
    res.json(purchase);
  } catch (err) {
    console.error("❌ Error fetching purchase:", err);
    res.status(500).json({ success: false, message: "Error fetching purchase" });
  }
});

module.exports = router;
