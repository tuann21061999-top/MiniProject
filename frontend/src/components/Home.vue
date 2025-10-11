<template>
  <div class="home">
    <!-- 🎯 Hero Section -->
    <section
      class="hero"
      :style="{ background: featuredColors[selectedIndex] || '#f7f7f7' }"
    >
      <div class="hero-inner">
        <!-- Bên trái -->
        <div class="hero-left">
          <h3>⚙️ Cấu hình nổi bật</h3>
          <transition name="fade-slide" mode="out-in">
            <ul v-if="selectedPhone" :key="selectedPhone._id">
              <li><b>Chip:</b> {{ selectedPhone.specs.chip }}</li>
              <li><b>Màn hình:</b> {{ selectedPhone.specs.display }}</li>
              <li><b>Camera:</b> {{ selectedPhone.specs.camera }}</li>
              <li><b>Pin:</b> {{ selectedPhone.specs.battery }}</li>
            </ul>
          </transition>
        </div>

        <!-- Giữa: Stack ảnh -->
        <div
          class="hero-center"
          @mousemove="handleMouseMove"
          @mouseleave="resetTilt"
          @click="nextProduct"
        >
          <div class="phone-stack">
            <div
              v-for="(p, i) in featuredPhones"
              :key="p._id"
              class="phone-card"
              :class="{ active: i === selectedIndex }"
              :style="getCardStyle(i)"
            >
              <img :src="p.image" :alt="p.name" />
            </div>
          </div>
        </div>

        <!-- Bên phải -->
        <div class="hero-right">
          <div class="product-menu">
            <h3>📱 Sản phẩm nổi bật</h3>
            <ul>
              <li
                v-for="(p, i) in featuredPhones"
                :key="p._id"
                :class="{ active: i === selectedIndex }"
                @click="selectProduct(i)"
              >
                {{ p.name }}
              </li>
            </ul>
          </div>

          <transition name="fade-slide" mode="out-in">
            <div class="product-info" v-if="selectedPhone" :key="selectedPhone._id">
              <h1>{{ selectedPhone.name }}</h1>
              <p class="price">Giá: {{ formatPrice(selectedPhone.basePrice) }}</p>
              <button
                class="buy-btn"
                :style="{ backgroundColor: featuredColors[selectedIndex] }"
                @click.stop="$router.push({ name: 'PhoneDetail', params: { id: selectedPhone._id } })"
              >
                🛒 Mua ngay
              </button>
            </div>
          </transition>
        </div>
      </div>
    </section>

    <!-- Danh mục -->
    <section class="categories">
      <h2>Danh mục nổi bật</h2>
      <div class="category-list">
        <div
          class="category-card"
          v-for="cat in categories"
          :key="cat.name"
          @click="goToCategory(cat.name)"
        >
          <img :src="cat.image" :alt="cat.name" />
          <h3>{{ cat.name }}</h3>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script>
import axios from "axios";
import Footer from "./Footer.vue";

export default {
  name: "Home",
  components: { Footer },
  data() {
    return {
      featuredPhones: [],
      selectedIndex: 0,
      featuredColors: ["#ffe5e0", "#e0f2ff", "#fff2cc"],
      tilt: { x: 0, y: 0 },
      categories: [
        { name: "iPhone", image: "https://cdn.tgdd.vn/Brand/1/logo-iphone-220x48.png" },
        { name: "Samsung", image: "https://cdn.tgdd.vn/Brand/1/logo-samsung-220x48.png" },
        { name: "Xiaomi", image: "https://cdn.tgdd.vn/Brand/1/logo-xiaomi-220x48.png" },
      ],
    };
  },
  computed: {
    selectedPhone() {
      return this.featuredPhones[this.selectedIndex] || null;
    },
  },
  methods: {
    /** ✅ Lấy đúng 3 sản phẩm nổi bật từ MongoDB */
    async fetchFeaturedPhones() {
      try {
        const res = await axios.get("http://localhost:5000/api/phones");
        const all = res.data || [];

        // 🔹 Danh sách tên sản phẩm nổi bật cần lấy
        const highlightNames = [
          "Xiaomi 15 Ultra",
          "iPhone 17 Pro Max",
          "Samsung Galaxy S25 Ultra",
        ];

        // 🔹 Lọc theo tên (không phân biệt hoa thường)
        const featured = all.filter((p) =>
          highlightNames.some(
            (name) => p.name?.toLowerCase().includes(name.toLowerCase())
          )
        );

        // 🔹 Nếu trong DB chưa có đủ, lấy tạm 3 cái đầu (fallback)
        this.featuredPhones =
          featured.length >= 3
            ? featured
            : all.slice(0, 3).map((p) => ({
                ...p,
                specs: p.specs || {
                  chip: "Snapdragon 8 Gen 3",
                  display: "AMOLED 6.7 inch 120Hz",
                  camera: "200MP + 50MP + 10MP",
                  battery: "5000mAh sạc nhanh 45W",
                },
              }));

        // 🔹 Đảm bảo có field specs để hiển thị
        this.featuredPhones = this.featuredPhones.map((p) => ({
          ...p,
          specs: p.specs || {
            chip: "Snapdragon 8 Gen 3",
            display: "AMOLED 6.7 inch 120Hz",
            camera: "200MP + 50MP + 10MP",
            battery: "5000mAh sạc nhanh 45W",
          },
        }));
      } catch (err) {
        console.error("❌ Lỗi load phones:", err);
      }
    },

    selectProduct(i) {
      this.selectedIndex = i;
    },
    nextProduct() {
      this.selectedIndex = (this.selectedIndex + 1) % this.featuredPhones.length;
    },
    getCardStyle(i) {
      const offset = i - this.selectedIndex;
      const zIndex = 3 - Math.abs(offset);
      const translateX = offset * 60;
      const translateY = Math.abs(offset) * 25;
      const rotateZ = offset * 10;
      const scale = i === this.selectedIndex ? 1 : 0.9;
      const opacity = i === this.selectedIndex ? 1 : 0.7;
      const tiltX = this.tilt.x * 15;
      const tiltY = this.tilt.y * 15;
      return {
        zIndex,
        opacity,
        transform: `
          perspective(1000px)
          rotateX(${tiltY}deg)
          rotateY(${-tiltX}deg)
          translateX(${translateX}px)
          translateY(${translateY}px)
          rotateZ(${rotateZ}deg)
          scale(${scale})
        `,
        transition: "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease",
      };
    },
    handleMouseMove(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      this.tilt.x = x;
      this.tilt.y = y;
    },
    resetTilt() {
      this.tilt = { x: 0, y: 0 };
    },
    formatPrice(v) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(v);
    },
    goToCategory(name) {
      const brandMap = { iPhone: "Apple" };
      const brand = brandMap[name] || name;
      this.$router.push({ path: "/phones", query: { brand } });
    },
  },
  mounted() {
    this.fetchFeaturedPhones();
  },
};
</script>

<style scoped>
.home {
  text-align: center;
  background: #f7f9fc;
}

/* 🎯 Hero */
.hero {
  padding: 80px 40px;
  transition: background 0.6s ease;
}
.hero-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: auto;
}

/* Bên trái */
.hero-left {
  flex: 1;
  text-align: left;
  animation: fadeInLeft 1s ease;
}
.hero-left h3 {
  margin-bottom: 10px;
  color: #333;
}
.hero-left ul {
  list-style: none;
  padding: 0;
  font-size: 15px;
  line-height: 1.6;
}

/* Giữa - Stack + Parallax */
.hero-center {
  flex: 1.2;
  position: relative;
  display: flex;
  justify-content: center;
  height: 380px;
  perspective: 1000px;
  cursor: pointer;
}
.phone-stack {
  position: relative;
  width: 280px;
  height: 360px;
}
.phone-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 280px;
  height: 360px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
.phone-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 20px;
  transition: transform 0.3s ease;
}

/* Bên phải */
.hero-right {
  flex: 1;
  text-align: left;
  margin-left: 40px;
}
.product-menu {
  margin-left: 40px;
  margin-bottom: 25px;
}
.product-menu ul {
  list-style: none;
  padding: 0;
}
.product-menu li {
  cursor: pointer;
  padding: 10px 12px;
  margin: 10px 0;
  border-left: 4px solid transparent;
  border-radius: 6px;
  transition: all 0.3s ease;
}
.product-menu li:hover {
  background: rgba(255, 255, 255, 0.4);
}
.product-menu li.active {
  font-weight: bold;
  color: #ff6600;
  border-left: 4px solid #ff6600;
  background: rgba(255, 255, 255, 0.6);
}

.product-info h1 {
  margin-left: 40px;
  font-size: 26px;
  margin-bottom: 8px;
}
.price {
  margin-left: 40px;
  color: #ff6600;
  font-weight: bold;
}
.buy-btn {
  padding: 10px 22px;
  border: none;
  border-radius: 8px;
  color: black;
  font-weight: bold;
  cursor: pointer;
  margin-top: 12px;
  transition: transform 0.2s ease;
  margin-left: 40px;
}
.buy-btn:hover {
  transform: scale(1.07);
}

/* Hiệu ứng chuyển mượt */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.6s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Danh mục nổi bật */
.categories {
  margin: 60px auto 80px;
}
.categories h2 {
  font-size: 24px;
  margin-bottom: 30px;
  color: #333;
  font-weight: 700;
}
.category-list {
  display: flex;
  justify-content: center;
  gap: 30px;
}
.category-card {
  background: #fff;
  border: 1px solid #eee;
  padding: 25px;
  border-radius: 16px;
  width: 220px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.category-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
}
.category-card img {
  width: 100%;
  height: 50px;
  object-fit: contain;
  margin-bottom: 12px;
}
.category-card h3 {
  color: #333;
  font-size: 18px;
  font-weight: 600;
}
</style>
