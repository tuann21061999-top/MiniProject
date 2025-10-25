const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User.js");

const router = express.Router();

/* ====================== 🧩 ĐĂNG KÝ ====================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Thiếu thông tin" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashed,
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role },
    });
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ====================== 🔑 ĐĂNG NHẬP ====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Thiếu email hoặc mật khẩu" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Email chưa được đăng ký" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Sai mật khẩu" });

    res.json({
      message: "Đăng nhập thành công",
      user: { id: user._id, email: user.email, name: user.name, role: user.role, phone: user.phone || "" },
    });
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ====================== 📱 CẬP NHẬT / LIÊN KẾT SỐ ĐIỆN THOẠI ====================== */
router.put("/update-phone", async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone)
      return res.status(400).json({ error: "Thiếu email hoặc số điện thoại" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });

    // ✅ Cập nhật số điện thoại
    user.phone = phone;
    await user.save();

    res.json({
      message: user.phone
        ? "✅ Cập nhật số điện thoại thành công!"
        : "✅ Liên kết số điện thoại thành công!",
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("❌ Lỗi cập nhật SĐT:", err);
    res.status(500).json({ error: "Lỗi server khi cập nhật số điện thoại" });
  }
});

/* ====================== 🔐 CẬP NHẬT MẬT KHẨU ====================== */
router.put("/update-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword)
      return res.status(400).json({ error: "Thiếu thông tin" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Mật khẩu cũ không đúng" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "✅ Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error("❌ Lỗi đổi mật khẩu:", err);
    res.status(500).json({ error: "Lỗi server khi đổi mật khẩu" });
  }
});

module.exports = router;
