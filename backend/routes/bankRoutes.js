const express = require("express");
const Bank = require("../models/Bank.js");

const router = express.Router();

// Lấy toàn bộ danh sách ngân hàng
router.get("/", async (req, res) => {
  try {
    const banks = await Bank.find();
    res.json(banks);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy danh sách ngân hàng" });
  }
});

module.exports = router;
