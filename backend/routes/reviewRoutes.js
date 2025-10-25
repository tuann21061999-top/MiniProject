const express = require("express");
const Review = require("../models/review.js");
const router = express.Router();

// 🟢 Lấy review theo email
router.get("/:email", async (req, res) => {
  try {
    const review = await Review.findOne({ email: req.params.email });
    if (!review) return res.json({});
    res.json(review);
  } catch (err) {
    console.error("❌ Lỗi khi lấy review:", err);
    res.status(500).json({ error: "Không thể tải đánh giá" });
  }
});

// 🟠 Gửi đánh giá mới
router.post("/", async (req, res) => {
  try {
    const { email, username, phoneId, phoneName, rating, text } = req.body;
    console.log("📥 Nhận dữ liệu đánh giá:", req.body);

    if (!email || !username || !phoneId || !phoneName || !rating || !text)
      return res.status(400).json({ error: "Thiếu thông tin đánh giá" });

    let review = await Review.findOne({ email });

    if (!review) {
      // 🆕 Nếu chưa có review của user, tạo mới
      review = new Review({
        email,
        username,
        comments: {
          cmt1: { phoneId, phoneName, rating, text, date: new Date() },
        },
      });
    } else {
      // 🔁 Nếu đã có review của user, thêm cmt mới
      if (!review.comments) review.comments = {};
      const count = Object.keys(review.comments).length + 1;
      review.comments[`cmt${count}`] = {
        phoneId,
        phoneName,
        rating,
        text,
        date: new Date(),
      };

      // ✅ Báo với Mongoose rằng object đã thay đổi
      review.markModified("comments");
    }

    await review.save();
    console.log("✅ Đã lưu đánh giá thành công!");
    res.json({ message: "✅ Đánh giá đã được lưu!", review });
  } catch (err) {
    console.error("❌ Lỗi khi lưu đánh giá:", err);
    res.status(500).json({ error: err.message || "Lưu đánh giá thất bại" });
  }
});

// 🟢 Lấy tất cả bình luận theo phoneId (cho phần hiển thị công khai)
router.get("/all/:phoneId", async (req, res) => {
  try {
    const { phoneId } = req.params;

    // Lấy tất cả review (mỗi user có thể có nhiều cmt trong comments object)
    const reviews = await Review.find().lean();

    const allComments = [];

    reviews.forEach((rev) => {
      if (rev.comments) {
        Object.values(rev.comments).forEach((cmt) => {
          // ✅ Chỉ lấy những comment trùng phoneId
          if (cmt.phoneId === phoneId) {
            allComments.push({
              username: rev.username,
              phoneId: cmt.phoneId,
              phoneName: cmt.phoneName,
              rating: cmt.rating,
              text: cmt.text,
              date: cmt.date,
            });
          }
        });
      }
    });

    res.json(allComments);
  } catch (err) {
    console.error("❌ Lỗi lấy tất cả review:", err);
    res.status(500).json({ error: "Không thể tải danh sách bình luận" });
  }
});

module.exports = router;
