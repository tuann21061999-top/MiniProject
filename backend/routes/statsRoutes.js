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

/* ✅ API: Lợi nhuận theo máy và bảo hành, có thể lọc theo ngày/tháng/năm */
router.get("/profit", async (req, res) => {
  try {
    const { mode = "month", date, month, year } = req.query;
    const filter = { status: "done" };

    // 🎯 Xác định khung thời gian lọc chính xác
    let startDate, endDate;
    if (mode === "day" && date) {
      startDate = new Date(`${date}T00:00:00.000Z`);
      endDate = new Date(`${date}T23:59:59.999Z`);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    } else if (mode === "month" && month) {
      const [y, m] = month.split("-");
      startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      filter.createdAt = { $gte: startDate, $lt: endDate };
    } else if (mode === "year" && year) {
      startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(Number(year) + 1, 0, 1, 0, 0, 0));
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    // ✅ Lấy dữ liệu đơn hàng
    const purchases = await Purchase.find(filter);

    // Tổng hợp các giá trị
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const deviceStats = {};
    const warrantyStats = {
      gold: { name: "Bảo hành vàng", qty: 0, revenue: 0, profit: 0 },
      vip: { name: "Bảo hành VIP", qty: 0, revenue: 0, profit: 0 },
    };

    // ✅ Duyệt từng đơn
    purchases.forEach((p) => {
      // --- Lợi nhuận bán máy ---
      p.items.forEach((item) => {
        const name = item.name || "Sản phẩm không tên";
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const importPrice = Number(item.importPrice || 0);

        const revenue = price * quantity;
        const cost = importPrice * quantity;
        const profit = revenue - cost;

        totalRevenue += revenue;
        totalCost += cost;
        totalProfit += profit;

        if (!deviceStats[name]) {
          deviceStats[name] = { name, qty: 0, revenue: 0, cost: 0, profit: 0 };
        }

        deviceStats[name].qty += quantity;
        deviceStats[name].revenue += revenue;
        deviceStats[name].cost += cost;
        deviceStats[name].profit += profit;
      });

      // --- Lợi nhuận bảo hành ---
      const warrantyFee = Number(p.warrantyFee || 0);
      if (p.warranty === "Bảo hành vàng") {
        warrantyStats.gold.qty += 1;
        warrantyStats.gold.revenue += warrantyFee;
        warrantyStats.gold.profit += warrantyFee;
        totalRevenue += warrantyFee;
        totalProfit += warrantyFee;
      } else if (p.warranty === "Bảo hành VIP") {
        warrantyStats.vip.qty += 1;
        warrantyStats.vip.revenue += warrantyFee;
        warrantyStats.vip.profit += warrantyFee;
        totalRevenue += warrantyFee;
        totalProfit += warrantyFee;
      }
    });

    const deviceDetails = Object.values(deviceStats).sort(
      (a, b) => b.profit - a.profit
    );

    res.json({
      mode,
      range:
        mode === "day"
          ? date
          : mode === "month"
          ? month
          : mode === "year"
          ? year
          : "Tất cả",
      totalRevenue,
      totalCost,
      totalProfit,
      deviceDetails,
      warrantyStats,
    });
  } catch (err) {
    console.error("❌ Lỗi /stats/profit:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // ✅ Quan trọng: export đúng router
