const express = require("express");
const PayMethod = require("../models/PayMethod.js");
const router = express.Router();

// 📌 Lấy phương thức thanh toán của user (kèm email user)
router.get("/:userId", async (req, res) => {
  try {
    const methods = await PayMethod.find({ userId: req.params.userId })
      .populate("userId", "email") // lấy thêm email từ User
      .sort({ createdAt: -1 });

    res.json(methods);
  } catch (err) {
    console.error("❌ Lỗi lấy phương thức thanh toán:", err);
    res.status(500).json({ error: "Lỗi server khi lấy phương thức thanh toán" });
  }
});

// 📌 Thêm phương thức thanh toán
router.post("/", async (req, res) => {
  try {
    const { userId, type, provider, accountNumber, expiry, isDefault } = req.body;

    if (isDefault) {
      // reset các default cũ của user này
      await PayMethod.updateMany({ userId }, { isDefault: false });
    }

    const newMethod = new PayMethod({
      userId,
      type,
      provider,
      accountNumber,
      expiry,
      isDefault,
    });

    await newMethod.save();
    // populate email ngay khi thêm mới
    const populated = await PayMethod.findById(newMethod._id).populate("userId", "email");

    res.json(populated);
  } catch (err) {
    console.error("❌ Lỗi thêm phương thức:", err);
    res.status(500).json({ error: "Không thêm được phương thức thanh toán" });
  }
});

// 📌 Cập nhật phương thức thanh toán
router.put("/:id", async (req, res) => {
  try {
    const { isDefault, userId } = req.body;

    if (isDefault && userId) {
      await PayMethod.updateMany({ userId }, { isDefault: false });
    }

    const updated = await PayMethod.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("userId", "email");

    res.json(updated);
  } catch (err) {
    console.error("❌ Lỗi cập nhật phương thức:", err);
    res.status(500).json({ error: "Không cập nhật được phương thức thanh toán" });
  }
});

// 📌 Xóa phương thức thanh toán
router.delete("/:id", async (req, res) => {
  try {
    await PayMethod.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi xóa phương thức:", err);
    res.status(500).json({ error: "Không xóa được phương thức thanh toán" });
  }
});

module.exports = router;
