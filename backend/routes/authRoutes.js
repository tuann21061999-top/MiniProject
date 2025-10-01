const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User"); // phải đúng đường dẫn

const router = express.Router();

/* ĐĂNG KÝ */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Thiếu thông tin" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashed,
    });

    // Trả về thông tin cần thiết
    res.status(201).json({
      message: "Đăng ký thành công",
      user: { id: newUser._id, email: newUser.email },
    });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ĐĂNG NHẬP */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Thiếu email hoặc mật khẩu" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email chưa được đăng ký" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Sai mật khẩu" });
    }

    res.json({
      message: "Đăng nhập thành công",
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
