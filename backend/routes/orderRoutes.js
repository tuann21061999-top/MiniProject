const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// 🟢 Thêm sản phẩm vào giỏ hàng (theo email)
// 🟢 Thêm sản phẩm vào giỏ hàng
router.post("/add", async (req, res) => {
  try {
    const { email, item } = req.body;
    if (!email || !item) {
      return res.status(400).json({ error: "Thiếu email hoặc sản phẩm" });
    }

    let order = await Order.findOne({ email });

    if (!order) {
      order = new Order({ email, items: [item] });
    } else {
      const exist = order.items.find(
        (i) =>
          String(i.phoneId) === String(item.phoneId) &&
          i.color === item.color &&
          i.storage === item.storage
      );

      if (exist) {
        exist.quantity += item.quantity || 1;
      } else {
        order.items.push(item); // ✅ item có image
      }
    }

    await order.save();
    res.json({ items: order.items, total: order.total });
  } catch (err) {
    console.error("❌ Lỗi thêm sản phẩm:", err);
    res.status(500).json({ error: "Lỗi server khi thêm sản phẩm" });
  }
});


// 🟠 Cộng / trừ số lượng (delta)
router.put("/change-quantity", async (req, res) => {
  try {
    const { email, phoneId, color, storage, delta } = req.body;

    let order = await Order.findOne({ email });
    if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

    const item = order.items.find(
      (i) =>
        String(i.phoneId) === String(phoneId) &&
        i.color === color &&
        i.storage === storage
    );
    if (!item) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    item.quantity += delta;

    if (item.quantity <= 0) {
      // Nếu số lượng <= 0 thì xoá sản phẩm đó
      order.items = order.items.filter(
        (i) =>
          !(
            String(i.phoneId) === String(phoneId) &&
            i.color === color &&
            i.storage === storage
          )
      );
    }

    if (order.items.length > 0) {
      order.total = order.items.reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      );
      await order.save();
      return res.json(order);
    } else {
      // Nếu giỏ hàng trống → xoá order
      await Order.deleteOne({ email });
      return res.json({ email, items: [], total: 0 });
    }
  } catch (err) {
    console.error("❌ Lỗi change-quantity:", err);
    res.status(500).json({ error: "Lỗi server khi thay đổi số lượng" });
  }
});


router.delete("/remove", async (req, res) => {
  try {
    const { email, phoneId, color, storage } = req.body;

    let order = await Order.findOne({ email });
    if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

    // Xóa đúng 1 biến thể (theo phoneId + color + storage)
    order.items = order.items.filter(
      (i) =>
        !(
          String(i.phoneId) === String(phoneId) &&
          i.color === color &&
          i.storage === storage
        )
    );

    if (order.items.length > 0) {
      order.total = order.items.reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      );
      await order.save();
      return res.json(order);
    } else {
      await Order.deleteOne({ email });
      return res.json({ items: [] });
    }
  } catch (err) {
    console.error("❌ Lỗi khi xóa sản phẩm:", err);
    res.status(500).json({ error: "Lỗi server khi xóa sản phẩm" });
  }
});




// 🔵 Cập nhật số lượng
router.put("/update-quantity", async (req, res) => {
  try {
    const { email, phoneId, quantity } = req.body;

    let order = await Order.findOne({ email });
    if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

    const item = order.items.find(i => i.phoneId === phoneId);
    if (!item) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    item.quantity = quantity;

    if (item.quantity <= 0) {
      // Nếu số lượng <= 0 thì xoá sản phẩm
      order.items = order.items.filter(i => i.phoneId !== phoneId);
    }

    if (order.items.length > 0) {
      order.total = order.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      await order.save();
      return res.json(order);
    } else {
      // Nếu không còn sản phẩm -> xoá luôn order
      await Order.deleteOne({ email });
      return res.json({ message: "Đơn hàng đã bị xóa vì không còn sản phẩm" });
    }
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật số lượng:", err);
    res.status(500).json({ error: "Lỗi server khi cập nhật số lượng" });
  }
});

// 🔎 Lấy giỏ hàng theo email
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const order = await Order.findOne({ email });
    if (!order) return res.json({ email, items: [], total: 0 });
    res.json(order);
  } catch (err) {
    console.error("❌ Lỗi khi lấy giỏ hàng:", err);
    res.status(500).json({ error: "Lỗi server khi lấy giỏ hàng" });
  }
});
// 🗑️ Xóa toàn bộ giỏ hàng
router.delete("/clear", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Thiếu email" });

    await Order.deleteOne({ email });
    res.json({ success: true, items: [], total: 0 });
  } catch (err) {
    console.error("❌ Lỗi khi xoá giỏ hàng:", err);
    res.status(500).json({ error: "Lỗi server khi xoá giỏ hàng" });
  }
});

module.exports = router;
