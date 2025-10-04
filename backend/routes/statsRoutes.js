// routes/statsRoutes.js
const express = require("express");
const Purchase = require("../models/Purchase"); // nhớ đúng tên file model
const router = express.Router();

// ✅ Doanh thu theo ngày (chỉ tính đơn "done")
router.get("/revenue", async (req, res) => {
  try {
    const purchases = await Purchase.find({ status: "done" });

    const revenueByDate = {};
    purchases.forEach((p) => {
      const dateStr = new Date(p.createdAt).toISOString().slice(0, 10);
      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + p.total;
    });

    res.json(revenueByDate);
  } catch (err) {
    console.error("❌ Lỗi /stats/revenue:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Top sản phẩm bán chạy (chỉ tính đơn "done")
router.get("/top-products", async (req, res) => {
  try {
    const purchases = await Purchase.find({ status: "done" });

    const productCount = {};
    purchases.forEach((p) => {
      p.items.forEach((item) => {
        if (!productCount[item.name]) {
          productCount[item.name] = 0;
        }
        productCount[item.name] += item.quantity;
      });
    });

    const sorted = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    res.json(sorted.map(([name, qty]) => ({ name, qty })));
  } catch (err) {
    console.error("❌ Lỗi /stats/top-products:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // ✅ Quan trọng: export đúng router