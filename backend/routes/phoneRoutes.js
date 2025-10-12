const express = require("express");
const router = express.Router();
const Phone = require("../models/Phones.js");

// 🔍 Tìm kiếm điện thoại nâng cao
router.get("/search", async (req, res) => {
  try {
    const { q, batteryMin, batteryMax, sim, storage } = req.query;
    let query = {};

    // Tìm theo tên hoặc mô tả
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Tìm theo dung lượng pin
    if (batteryMin || batteryMax) {
      query.battery = {};
      if (batteryMin) query.battery.$gte = Number(batteryMin);
      if (batteryMax) query.battery.$lte = Number(batteryMax);
    }

    // Tìm theo SIM
    if (sim) query.sim = sim;

    // Tìm theo bộ nhớ trong
    if (storage) {
      query["storages.size"] = { $in: Array.isArray(storage) ? storage : [storage] };
    }

    const phones = await Phone.find(query);
    res.json(phones);
  } catch (err) {
    console.error("❌ Lỗi tìm kiếm:", err);
    res.status(500).json({ error: "Lỗi server khi tìm kiếm" });
  }
});

// 📱 Lấy danh sách tất cả điện thoại
router.get("/", async (req, res) => {
  try {
    const phones = await Phone.find().populate("specs"); // ✅ Quan trọng: populate specs luôn
    res.json(phones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔎 Lấy điện thoại theo tên (nếu cần dùng đường dẫn /name/:name)
router.get("/name/:name", async (req, res) => {
  try {
    const phone = await Phone.findOne({ name: req.params.name }).populate("specs");
    if (!phone) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json(phone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id).populate("specs");
    if (!phone) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json(phone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Thêm mới một điện thoại
router.post("/", async (req, res) => {
  try {
    const newPhone = new Phone(req.body);
    const savedPhone = await newPhone.save();
    res.json(savedPhone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📝 Cập nhật sản phẩm
router.put("/:id", async (req, res) => {
  try {
    const updatedPhone = await Phone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPhone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🗑️ Xóa sản phẩm
router.delete("/:id", async (req, res) => {
  try {
    await Phone.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
