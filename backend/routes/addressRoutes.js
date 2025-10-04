const express = require("express");
const Address = require("../models/Address.js");
const router = express.Router();

/* ✅ Xác định miền dựa trên tỉnh */
function getRegion(province) {
  const north = [
    "Hà Nội","Hải Phòng","Quảng Ninh","Bắc Ninh","Bắc Giang","Nam Định","Thái Bình",
    "Hải Dương","Hưng Yên","Vĩnh Phúc","Phú Thọ","Ninh Bình","Hà Nam","Thái Nguyên",
    "Lạng Sơn","Cao Bằng","Yên Bái","Tuyên Quang","Hà Giang","Lào Cai","Bắc Kạn",
    "Điện Biên","Lai Châu","Sơn La","Hòa Bình"
  ];
  const central = [
    "Thanh Hóa","Nghệ An","Hà Tĩnh","Quảng Bình","Quảng Trị","Thừa Thiên Huế",
    "Đà Nẵng","Quảng Nam","Quảng Ngãi","Bình Định","Phú Yên","Khánh Hòa",
    "Ninh Thuận","Bình Thuận","Kon Tum","Gia Lai","Đắk Lắk","Đắk Nông","Lâm Đồng"
  ];
  const south = [
    "TP Hồ Chí Minh","Bình Dương","Đồng Nai","Bà Rịa - Vũng Tàu","Tây Ninh",
    "Long An","Tiền Giang","Bến Tre","Vĩnh Long","Trà Vinh","Đồng Tháp","An Giang",
    "Kiên Giang","Cần Thơ","Hậu Giang","Sóc Trăng","Bạc Liêu","Cà Mau","Bình Phước"
  ];

  if (north.includes(province)) return "Miền Bắc";
  if (central.includes(province)) return "Miền Trung";
  if (south.includes(province)) return "Miền Nam";
  return "Khác";
}

/* 📌 Lấy danh sách địa chỉ theo user */
router.get("/:userId", async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    console.error("❌ Lỗi lấy địa chỉ:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* 📌 Thêm địa chỉ */
router.post("/", async (req, res) => {
  try {
    const { userId, email, fullName, phone, province, street, isDefault } = req.body;
    const region = getRegion(province);

    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const newAddr = new Address({
      userId,
      email,
      fullName,
      phone,
      province,
      street,
      region,
      isDefault,
    });
    await newAddr.save();
    res.status(201).json(newAddr);
  } catch (err) {
    console.error("❌ Lỗi thêm địa chỉ:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* 📌 Cập nhật địa chỉ */
router.put("/:id", async (req, res) => {
  try {
    const { province, isDefault } = req.body;
    let region = undefined;
    if (province) region = getRegion(province);

    if (isDefault) {
      await Address.updateMany({ userId: req.body.userId }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(region ? { region } : {}) },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("❌ Lỗi cập nhật địa chỉ:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* 📌 Xóa địa chỉ */
router.delete("/:id", async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa địa chỉ" });
  } catch (err) {
    console.error("❌ Lỗi xóa địa chỉ:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
