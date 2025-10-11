const express = require("express");
const Pin = require("../models/pin.js");
const router = express.Router();
const bcrypt = require("bcrypt");

// 🟢 Lưu hoặc cập nhật mã PIN (mã hóa)
router.post("/set", async (req, res) => {
  try {
    const { email, pin } = req.body;
    if (!email || !pin)
      return res.status(400).json({ success: false, message: "Thiếu email hoặc PIN" });

    const hashed = await bcrypt.hash(String(pin), 10);

    let existing = await Pin.findOne({ email });
    if (existing) {
      existing.pin = hashed;
      await existing.save();
    } else {
      await Pin.create({ email, pin: hashed });
    }

    console.log("✅ PIN đã lưu cho:", email);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi khi lưu PIN:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 🔍 Kiểm tra xem email có PIN chưa
router.get("/:email", async (req, res) => {
  try {
    const record = await Pin.findOne({ email: req.params.email });
    res.json({ hasPin: !!record });
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra PIN:", err);
    res.status(500).json({ hasPin: false });
  }
});

// 🔒 Xác thực mã PIN
router.post("/verify", async (req, res) => {
  try {
    const { email, pin } = req.body;
    if (!email || !pin)
      return res.json({ valid: false, message: "Thiếu dữ liệu" });

    const record = await Pin.findOne({ email });
    if (!record || !record.pin)
      return res.json({ valid: false, message: "Không tìm thấy người dùng hoặc mã PIN trống" });

    const isMatch = await bcrypt.compare(String(pin), record.pin);
    if (!isMatch) return res.json({ valid: false, message: "Sai mã PIN" });

    console.log("✅ Xác thực PIN thành công cho:", email);
    res.json({ valid: true });
  } catch (err) {
    console.error("❌ Lỗi xác thực PIN:", err);
    res.status(500).json({ valid: false, message: "Lỗi server" });
  }
});

module.exports = router;
