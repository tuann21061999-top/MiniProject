<template>
  <div class="review-container">
    <h3>⭐ Đánh giá & Bình luận</h3>

    <!-- Form gửi đánh giá -->
    <div class="review-form">
      <div class="stars">
        <span
          v-for="n in 5"
          :key="n"
          class="star"
          :class="{ active: rating >= n }"
          @click="rating = n"
        >★</span>
      </div>

      <textarea
        v-model="text"
        placeholder="Nhập bình luận của bạn..."
        rows="3"
      ></textarea>

      <button @click="submitReview">Gửi đánh giá</button>
    </div>

    <!-- Danh sách bình luận -->
    <div v-if="filteredReviews.length" class="review-list">
      <h4>💬 Bình luận của bạn cho {{ phoneName }}</h4>
      <div v-for="(cmt, i) in filteredReviews" :key="i" class="review-item">
        <div class="review-header">
          <span class="user">👤 {{ username }}</span>
          <span class="phone">📱 {{ cmt.phoneName }}</span>
          <span class="rating">{{ "★".repeat(cmt.rating) }}</span>
          <span class="date">{{ formatDate(cmt.date) }}</span>
        </div>
        <p class="text">{{ cmt.text }}</p>
      </div>
    </div>

    <p v-else class="no-review">Chưa có bình luận nào cho sản phẩm này</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Review",
  props: ["phoneId", "phoneName"],
  data() {
    return {
      rating: 0,
      text: "",
      reviews: [], // tất cả review của user
      userEmail: "",
      username: "",
    };
  },
  computed: {
    // 🔹 Lọc ra các bình luận chỉ dành cho sản phẩm hiện tại
    filteredReviews() {
      return this.reviews.filter((c) => c.phoneId === this.phoneId);
    },
  },
  methods: {
  async fetchReviews() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    this.userEmail = user.email;
    this.username = user.username || user.name || user.email;
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/${user.email}`);
      if (res.data && res.data.comments) {
        this.reviews = Object.values(res.data.comments).reverse();
      } else {
        this.reviews = [];
      }
    } catch (err) {
      console.error("❌ Lỗi tải review:", err);
      this.reviews = [];
    }
  },

  async submitReview() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("⚠️ Vui lòng đăng nhập để gửi đánh giá!");
      this.$router.push("/login");
      return;
    }

    if (!this.text.trim() || this.rating === 0) {
      alert("⚠️ Vui lòng nhập bình luận và chọn số sao!");
      return;
    }

    const data = {
      email: user.email,
      username: user.username || user.name || user.email,
      phoneId: this.phoneId,
      phoneName: this.phoneName,
      rating: this.rating,
      text: this.text.trim(),
    };

    console.log("📤 Gửi dữ liệu đánh giá:", data); // ✅ thêm log kiểm tra

    try {
      const res = await axios.post("http://localhost:5000/api/reviews", data);
      console.log("✅ Phản hồi server:", res.data);
      alert("✅ Gửi đánh giá thành công!");
      this.text = "";
      this.rating = 0;
      await this.fetchReviews();
    } catch (err) {
      console.error("❌ Lỗi gửi review:", err.response?.data || err.message);
      alert(
        "❌ Gửi đánh giá thất bại: " +
          (err.response?.data?.error || "Lỗi server, kiểm tra console!")
      );
    }
  },

  formatDate(date) {
    return new Date(date).toLocaleString("vi-VN");
  },
},
  mounted() {
    this.fetchReviews();
  },
};
</script>

<style scoped>
.review-container {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-top: 32px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.review-form {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stars {
  display: flex;
  gap: 4px;
}
.star {
  font-size: 24px;
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s ease, transform 0.1s ease;
}
.star:hover {
  transform: scale(1.15);
}
.star.active {
  color: #ffcc00;
}

textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  resize: none;
  outline: none;
  transition: border 0.2s ease;
}
textarea:focus {
  border-color: #ff6600;
}

button {
  background: linear-gradient(135deg, #ff6600, #ff9933);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.25s ease;
  align-self: flex-start;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 102, 0, 0.3);
}

.review-list {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.review-item {
  padding: 12px 0;
  border-bottom: 1px solid #f3f3f3;
}
.review-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  font-weight: 500;
  color: #333;
}
.user {
  font-weight: bold;
  color: #444;
}
.phone {
  color: #007aff;
}
.rating {
  color: #ffcc00;
}
.text {
  margin-top: 6px;
  color: #555;
}
.no-review {
  color: #999;
  font-style: italic;
  text-align: center;
}
</style>
