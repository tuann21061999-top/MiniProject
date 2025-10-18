// routes/statsRoutes.js
const express = require("express");
const Purchase = require("../models/Purchase"); // nhớ đúng tên file model
const router = express.Router();

// ✅ Doanh thu theo ngày (chỉ tính đơn "done"), lọc theo tháng nếu có param ?month=YYYY-MM
router.get("/revenue", async (req, res) => {
  try {
    const { month } = req.query; // ví dụ "2025-10"
    let filter = { status: "done" };

    if (month) {
      // Lọc những đơn trong tháng đó (createdAt từ đầu tháng đến đầu tháng kế tiếp)
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1); // sang tháng tiếp theo

      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const purchases = await Purchase.find(filter);

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

router.get("/potential-customers", async (req, res) => {
  try {
    const purchases = await Purchase.find({ status: "done" });

    // key = email, value = object info
    const customerMap = {};

    purchases.forEach((p) => {
      if (!customerMap[p.email]) {
        customerMap[p.email] = {
          email: p.email,
          fullName: p.fullName,
          phone: p.phone,
          totalSpent: 0,
          totalQuantity: 0,
        };
      }

      customerMap[p.email].totalSpent += p.total;
      customerMap[p.email].totalQuantity += p.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    });

    // Chuyển object thành array và sắp xếp giảm dần theo totalSpent
    const customers = Object.values(customerMap).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );

    res.json(customers);
  } catch (err) {
    console.error("❌ Lỗi /stats/potential-customers:", err);
    res.status(500).json({ error: err.message });
  }
});
// ✅ Lợi nhuận gộp theo tên sản phẩm (theo từng sản phẩm trong đơn, chia phí đều)
router.get("/profit", async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { status: "done" };

    // 🎯 Lọc theo tháng nếu có param ?month=YYYY-MM
    if (month) {
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const purchases = await Purchase.find(filter);

    let totalRevenue = 0;
    let totalCost = 0;
    const productStats = {}; // key = Tên sản phẩm

    purchases.forEach((purchase) => {
      const itemCount = purchase.items.length; // số loại sản phẩm trong đơn

      // 🎯 Tính tổng các loại phí cần chia đều
      const extraFees =
        (purchase.regionFee || 0) +
        (purchase.methodFee || 0) +
        (purchase.warrantyFee || 0);
      const shareFee = itemCount > 0 ? extraFees / itemCount : 0;

      purchase.items.forEach((item) => {
        const name = item.name || "Sản phẩm không tên";
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const importPrice = Number(item.importPrice || 0);

        // 🧮 Tính riêng cho từng sản phẩm
        const revenue = price * quantity;
        const cost = importPrice * quantity;
        const profit = revenue - cost + shareFee; // cộng phần phí chia đều

        totalRevenue += revenue;
        totalCost += cost;

        if (!productStats[name]) {
          productStats[name] = {
            name,
            revenue: 0,
            cost: 0,
            profit: 0,
            qty: 0,
          };
        }

        productStats[name].revenue += revenue;
        productStats[name].cost += cost;
        productStats[name].profit += profit;
        productStats[name].qty += quantity;
      });
    });

    const totalProfit = totalRevenue - totalCost;

    // 🔢 Sắp xếp theo lợi nhuận giảm dần
    const details = Object.values(productStats).sort(
      (a, b) => b.profit - a.profit
    );

    res.json({
      month: month || "Tất cả",
      totalRevenue,
      totalCost,
      totalProfit,
      details,
    });
  } catch (err) {
    console.error("❌ Lỗi /stats/profit:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API lấy danh sách đơn hàng chứa sản phẩm cụ thể
router.get("/product-orders", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "Thiếu tên sản phẩm" });

    const purchases = await Purchase.find({
      status: "done",
      "items.name": name
    });

    // Chỉ lấy thông tin cần thiết để hiển thị
    const result = purchases.map(p => ({
      orderId: p._id,
      customer: p.fullName,
      email: p.email,
      phone: p.phone,
      createdAt: p.createdAt,
      total: p.total,
      items: p.items.filter(i => i.name === name)
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Lỗi /stats/product-orders:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // ✅ Quan trọng: export đúng router
