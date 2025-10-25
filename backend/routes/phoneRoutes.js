const express = require("express");
const router = express.Router();
const Phone = require("../models/Phones.js");

// 🔍 Tìm kiếm điện thoại nâng cao (Giữ nguyên)
router.get("/search", async (req, res) => {
  try {
    const { q, batteryMin, batteryMax, sim, storage } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
    if (batteryMin || batteryMax) {
      query.battery = {};
      if (batteryMin) query.battery.$gte = Number(batteryMin);
      if (batteryMax) query.battery.$lte = Number(batteryMax);
    }
    if (sim) query.sim = sim;
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

// 📱 Lấy danh sách tất cả điện thoại (Giữ nguyên)
router.get("/", async (req, res) => {
  try {
    const phones = await Phone.find().populate("specs"); 
    res.json(phones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔎 Lấy điện thoại theo tên (Giữ nguyên)
router.get("/name/:name", async (req, res) => {
  try {
    const phone = await Phone.findOne({ name: req.params.name }).populate("specs");
    if (!phone) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json(phone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔎 Lấy điện thoại theo ID (Giữ nguyên)
router.get("/:id", async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id).populate("specs");
    if (!phone) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json(phone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Thêm mới một điện thoại (Giữ nguyên)
router.post("/", async (req, res) => {
  try {
    const newPhone = new Phone(req.body);
    const savedPhone = await newPhone.save();
    res.json(savedPhone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📝 Cập nhật sản phẩm (Đã sửa lỗi VersionError)
router.put("/:id", async (req, res) => {
  try {
    const newData = req.body;
    const updatedPhone = await Phone.findByIdAndUpdate(
      req.params.id,
      newData,
      { new: true, runValidators: true }
    );
    if (!updatedPhone) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }
    res.json(updatedPhone);
  } catch (err) {
    console.error("❌ Lỗi Cập Nhật SP:", err);
    res.status(400).json({ error: err.message });
  }
});

// 🗑️ Xóa sản phẩm (Giữ nguyên)
router.delete("/:id", async (req, res) => {
  try {
    await Phone.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ ROUTE MỚI: TRỪ KHO KHI BÁN HÀNG
router.post("/deduct-stock", async (req, res) => {
  try {
    const { items } = req.body; // Lấy danh sách sản phẩm từ đơn hàng

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Không có danh sách sản phẩm (items)" });
    }

    // Tạo một mảng các "lời hứa" (promises) để cập nhật kho
    const updatePromises = items.map(item => {
      // Dùng $inc (increment) với số âm để trừ kho
      // 'storages.$' sẽ chỉ cập nhật cái storage mà nó tìm thấy (vd: '128GB')
      return Phone.updateOne(
        { 
          _id: item.phoneId,            // Tìm đúng ID điện thoại
          "storages.size": item.storage // Tìm đúng phiên bản 'size'
        },
        { 
          $inc: { "storages.$.quantity": -item.quantity } // Trừ đi số lượng đã mua
        }
      );
    });

    // Thực thi tất cả các cập nhật cùng lúc
    await Promise.all(updatePromises);

    res.json({ message: "✅ Đã trừ kho thành công" });

  } catch (err) {
    console.error("❌ Lỗi trừ kho:", err);
    res.status(500).json({ error: "Lỗi server khi trừ kho" });
  }
});


module.exports = router;
