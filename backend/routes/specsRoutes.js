const express = require("express");
const Specs = require("../models/specs.js");
const router = express.Router();

// 🟢 Thêm mới cấu hình
router.post("/", async (req, res) => {
  try {
    const specs = await Specs.create(req.body);
    res.json({ success: true, specs });
  } catch (err) {
    console.error("❌ Lỗi tạo specs:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 🔍 Lấy danh sách cấu hình
router.get("/", async (req, res) => {
  try {
    const list = await Specs.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    console.log("📩 Nhận yêu cầu specs ID:", req.params.id);
    const specs = await Specs.findById(req.params.id);
    if (!specs) return res.status(404).json({ message: "Không tìm thấy specs" });
    res.json(specs);
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ✏️ Cập nhật cấu hình
router.put("/:id", async (req, res) => {
  try {
    const specs = await Specs.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, specs });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ❌ Xóa cấu hình
router.delete("/:id", async (req, res) => {
  try {
    await Specs.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
