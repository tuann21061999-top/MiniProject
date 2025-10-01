<template>
  <div class="home">
    <h1>Trang chủ - Phone Shop</h1>
    <p>Chào mừng bạn đến với cửa hàng điện thoại trực tuyến!</p>

    <!-- Banner -->
    <section
      v-if="showBanner"
      class="banner"
      :style="{ top: bannerY + 'px', left: bannerX + 'px' }"
      @mousedown="startDrag"
    >
      <div class="banner-content">
        <button class="close-btn" @click="showBanner = false">✖</button>
        <h2>Siêu sale khai trương</h2>
        <p>Giảm đến 20% cho tất cả điện thoại</p>
        <button @click="$router.push('/phones')">Mua ngay</button>
      </div>
    </section>

    <!-- Sản phẩm nổi bật -->
    <section class="intro">
      <h2>Sản phẩm nổi bật</h2>
      <div class="product-list">
        <div
          v-for="phone in featuredPhones"
          :key="phone._id"
          class="product-card"
          @click="$router.push({ name: 'PhoneDetail', params: { id: phone._id } })"
        >
          <img :src="phone.image" :alt="phone.name" />
          <h3>{{ phone.name }}</h3>
          <p>{{ phone.brand }}</p>
          <p class="price">Giá: {{ formatPrice(phone.basePrice) }}</p>
        </div>
      </div>
    </section>

    <!-- Khuyến mãi -->
    <section class="promotions">
      <h2>Khuyến mãi</h2>
      <ul>
        <li @click="$router.push('/promotions/september')">🎉 Ưu đãi tháng 9</li>
        <li @click="$router.push('/promotions/back-to-school')">📚 Ưu đãi tựu trường</li>
        <li @click="$router.push('/promotions/students')">🎓 Ưu đãi HSSV</li>
      </ul>
    </section>

    <!-- Tin tức -->
    <section class="news">
      <h2>Tin tức</h2>
      <p>Xem các tin tức công nghệ mới nhất và mẹo sử dụng điện thoại.</p>
      <button @click="$router.push('/news')">Xem thêm</button>
    </section>

    <!-- Chính sách -->
    <section class="policy">
      <h2>Chính sách</h2>
      <ul>
        <li @click="$router.push('/policy')">✅ Chính sách bảo hành</li>
        <li @click="$router.push('/policy')">🚚 Chính sách giao hàng</li>
        <li @click="$router.push('/policy')">💳 Chính sách thanh toán</li>
      </ul>
    </section>

    <!-- Liên hệ -->
    <section class="contact">
      <h2>Liên hệ nhanh</h2>
      <p>📞 Hotline: 0123 456 789</p>
      <button @click="$router.push('/contact')">Gửi liên hệ</button>
    </section>

    <!-- Footer -->
    <footer>
      <p>© 2025 Phone Shop. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Home",
  data() {
    return {
      showBanner: true,
      bannerX: 30,
      bannerY: 120,
      isDragging: false,
      offsetX: 0,
      offsetY: 0,

      featuredPhones: []
    };
  },
  methods: {
    async fetchFeaturedPhones() {
      try {
        const res = await axios.get("http://localhost:5000/api/phones");
        const allPhones = res.data;

        // lọc ra 3 sản phẩm bạn đã thêm trong MongoDB
        this.featuredPhones = allPhones.filter(p =>
          ["iPhone 17 Pro Max", "Samsung Galaxy S25 Ultra", "Xiaomi 15 Ultra"].includes(p.name)
        );
      } catch (err) {
        console.error("❌ Lỗi load phones:", err);
      }
    },

    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
      }).format(value);
    },

    startDrag(event) {
      this.isDragging = true;
      this.offsetX = event.clientX - this.bannerX;
      this.offsetY = event.clientY - this.bannerY;
      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
    },
    onDrag(event) {
      if (!this.isDragging) return;
      this.bannerX = event.clientX - this.offsetX;
      this.bannerY = event.clientY - this.offsetY;
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
    }
  },
  mounted() {
    this.fetchFeaturedPhones();
  }
};
</script>


<style scoped>
.home {
  text-align: center;
  padding: 20px;
}

/* Banner có thể kéo */
.banner {
  position: fixed;
  z-index: 2000;
  cursor: move;
}

.banner-content {
  position: relative;
  text-align: left;
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
  padding: 16px 20px;
  border-radius: 10px;
  width: 260px;
}

.banner-content h2 {
  margin: 0 0 10px;
  color: #ffcc00;
}

.banner-content button {
  margin-top: 10px;
  padding: 6px 12px;
  background: #ff6600;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
.banner-content button:hover {
  background: #e63946;
}

/* Nút tắt */
.close-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
}
.close-btn:hover {
  color: #ff4444;
}

/* Các section giữ nguyên */
section {
  margin: 40px 0;
}
h2 {
  margin-bottom: 15px;
}
.product-list {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}
.product-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 15px;
  width: 280px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
}
.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  border-color: #0077b6;
}
.product-card img {
  max-width: 100%;
  border-radius: 10px;
}
.price {
  color: #e63946;
  font-weight: bold;
}
.promotions ul {
  list-style: none;
  padding: 0;
}
.promotions li {
  margin: 8px 0;
  font-weight: bold;
  color: #0077b6;
  cursor: pointer;
}
.promotions li:hover {
  color: #e63946;
}
.news button {
  padding: 8px 16px;
  border: none;
  background: #0077b6;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}
.news button:hover {
  background: #023e8a;
}
.policy ul {
  list-style: none;
  padding: 0;
}
.policy li {
  margin: 6px 0;
  cursor: pointer;
}
.contact button {
  margin-top: 10px;
  padding: 10px 20px;
  background: #e63946;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
}
.contact button:hover {
  background: #d62828;
}
footer {
  margin-top: 40px;
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
}
</style>
