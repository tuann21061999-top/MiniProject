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
              <li v-if="selectedPhone.specs.chip"><b>Chip:</b> {{ selectedPhone.specs.chip["Chipset"] }}</li>
              <li v-if="selectedPhone.specs.screen">
                <b>Loại màn hình:</b> {{ selectedPhone.specs.screen["Loại màn hình"] }} <br>
                <b>Kích thước:</b> {{ selectedPhone.specs.screen["Kích thước"] }} <br>
                <b>Độ phân giải:</b> {{ selectedPhone.specs.screen["Độ phân giải"] }} <br>
                <b>Tần số quét:</b> {{ selectedPhone.specs.screen["Tần số quét"] }}
              </li>

              <!-- ✅ Hiển thị camera rõ ràng hơn -->
              <li v-if="typeof selectedPhone.specs.camera === 'object'">
                <b>Camera sau:</b> {{ selectedPhone.specs.camera["Camera sau"] }} <br />
                <b>Camera trước:</b> {{ selectedPhone.specs.camera["Camera trước"] }}
              </li>
              <li v-else>
                <b>Camera:</b> {{ selectedPhone.specs.camera }}
              </li>

              <!-- ✅ Hiển thị pin gọn gàng hơn -->
              <li v-if="typeof selectedPhone.specs.battery === 'object'">
                <b>Pin:</b> {{ selectedPhone.specs.battery["Dung lượng"] }} <br />
                <b>Sạc:</b> {{ selectedPhone.specs.battery["Sạc"] }}
              </li>
              <li v-else>
                <b>Pin:</b> {{ selectedPhone.specs.battery }}
              </li>
            </ul>
          </transition>
        </div>

        <!-- Giữa -->
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

    <!-- 🔥 ƯU ĐÃI NỔI BẬT -->
    <section class="hot-deals">
      <h2>🔥 Ưu đãi nổi bật</h2>
      <div class="deal-list">
        <div class="deal-card" v-for="deal in hotDeals" :key="deal.name">
          <img :src="deal.image" :alt="deal.name" />
          <div class="deal-info">
            <h3>{{ deal.name }}</h3>
            <p class="old-price">{{ formatPrice(deal.oldPrice) }}</p>
            <p class="new-price">{{ formatPrice(deal.newPrice) }}</p>
            <button @click="$router.push('/phones')">Xem ngay</button>
          </div>
          <div class="tag">Giảm {{ deal.discount }}%</div>
        </div>
      </div>
    </section>

    <!-- 💬 ĐÁNH GIÁ KHÁCH HÀNG -->
    <section class="testimonials">
      <h2>💬 Khách hàng nói gì về T&V Mobile</h2>
      <div class="testimonial-list">
        <div class="testimonial" v-for="t in testimonials" :key="t.name">
          <img :src="t.avatar" />
          <p>"{{ t.comment }}"</p>
          <h4>{{ t.name }}</h4>
          <div class="stars">⭐⭐⭐⭐⭐</div>
        </div>
      </div>
    </section>

    <!-- 🤝 THƯƠNG HIỆU HỢP TÁC -->
    <section class="brands">
      <h2>🤝 Thương hiệu hợp tác</h2>
      <div class="brand-logos">
        <img v-for="b in brands" :key="b" :src="b" />
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
      hotDeals: [
        {
          name: "iPhone 15 Pro Max",
          oldPrice: 37990000,
          newPrice: 32990000,
          discount: 13,
          image: "https://cdn.tgdd.vn/Products/Images/42/302669/iphone-15-pro-max-gold-thumb-600x600.jpg",
        },
        {
          name: "Samsung Galaxy S24 Ultra",
          oldPrice: 31990000,
          newPrice: 28990000,
          discount: 9,
          image: "https://cdn.tgdd.vn/Products/Images/42/305658/samsung-galaxy-s24-ultra-thumb-600x600.jpg",
        },
        {
          name: "Xiaomi 14 Ultra",
          oldPrice: 25990000,
          newPrice: 21990000,
          discount: 15,
          image: "https://cdn.tgdd.vn/Products/Images/42/311167/xiaomi-14-ultra-thumb-600x600.jpg",
        },
      ],
      testimonials: [
        {
          name: "Nguyễn Minh Tuấn",
          comment: "Mua iPhone ở đây rất hài lòng, tư vấn kỹ và giao hàng nhanh.",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        {
          name: "Trần Hồng Anh",
          comment: "Giá tốt, nhiều khuyến mãi, dịch vụ bảo hành tận tâm!",
          avatar: "https://randomuser.me/api/portraits/women/2.jpg",
        },
        {
          name: "Lê Văn Quang",
          comment: "Đổi iPhone cũ lấy mới cực nhanh, rất tiện lợi!",
          avatar: "https://randomuser.me/api/portraits/men/3.jpg",
        },
      ],
      brands: [
        "https://cdn.tgdd.vn/Brand/1/logo-iphone-220x48.png",
        "https://cdn.tgdd.vn/Brand/1/logo-samsung-220x48.png",
        "https://cdn.tgdd.vn/Brand/1/logo-oppo-220x48.png",
        "https://cdn.tgdd.vn/Brand/1/logo-xiaomi-220x48.png",
        "https://cdn.tgdd.vn/Brand/1/logo-vivo-220x48.png",
      ],
    };
  },
  computed: {
    selectedPhone() {
      return this.featuredPhones[this.selectedIndex] || null;
    },
  },
  methods: {
    async fetchFeaturedPhones() {
      try {
        const res = await axios.get("http://localhost:5000/api/phones");
        const all = res.data || [];
        const highlightNames = ["Xiaomi 15 Ultra", "iPhone 17 Pro Max", "Samsung Galaxy S25 Ultra"];
        const featured = all.filter((p) =>
          highlightNames.some((name) => p.name?.toLowerCase().includes(name.toLowerCase()))
        );
        this.featuredPhones = featured.length >= 3 ? featured : all.slice(0, 3);
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
      };
    },
    handleMouseMove(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      this.tilt.x = (e.clientX - rect.left) / rect.width - 0.5;
      this.tilt.y = (e.clientY - rect.top) / rect.height - 0.5;
    },
    resetTilt() {
      this.tilt = { x: 0, y: 0 };
    },
    formatPrice(v) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);
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

/* 🎯 Hero Section */
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

/* 🎬 Giữa - Stack + Hiệu ứng nghiêng 3D */
.hero-center {
  flex: 1.2;
  position: relative;
  display: flex;
  justify-content: center;
  height: 400px;
  perspective: 1000px;
  cursor: pointer;
  transition: transform 0.6s ease;
}

.phone-stack {
  position: relative;
  width: 280px;
  height: 380px;
  transform-style: preserve-3d;
}

.phone-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 280px;
  height: 380px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  transition:
    transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1),
    opacity 0.4s ease,
    box-shadow 0.3s ease;
}

.phone-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 20px;
  transition: transform 0.4s ease, filter 0.4s ease;
}

.phone-card.active {
  z-index: 5;
  opacity: 1;
  transform: scale(1) translateZ(40px);
}

.phone-card:not(.active) {
  opacity: 0.8;
  transform: scale(0.9) translateY(20px);
}

/* Hiệu ứng hover */
.hero-center:hover .phone-card.active img {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* 🎥 Hiệu ứng chuyển cảnh giữa các sản phẩm */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.8s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 🧭 Bên phải */
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
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  margin-left: 40px;
}
.buy-btn:hover {
  transform: scale(1.07);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

/* ✨ Animation keyframes */
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
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}
.category-card:hover {
  transform: translateY(-8px);
}

/* 🔥 ƯU ĐÃI NỔI BẬT */
.hot-deals {
  background: #fff7f0;
  padding: 50px 0;
}
.deal-list {
  display: flex;
  justify-content: center;
  gap: 25px;
  flex-wrap: wrap;
}
.deal-card {
  position: relative;
  background: white;
  border-radius: 16px;
  width: 250px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: 0.3s;
}
.deal-card:hover {
  transform: translateY(-6px);
}
.deal-card img {
  width: 100%;
  height: 180px;
  object-fit: contain;
  background: #fafafa;
}
.deal-info {
  padding: 12px;
}
.old-price {
  text-decoration: line-through;
  color: #999;
}
.new-price {
  color: #e74c3c;
  font-weight: bold;
}
.deal-info button {
  margin-top: 8px;
  padding: 6px 10px;
  background: #ff6600;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #e74c3c;
  color: white;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

/* 💬 Đánh giá khách hàng */
.testimonials {
  padding: 60px 0;
  background: #fff;
}
.testimonial-list {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}
.testimonial {
  width: 280px;
  background: #fdfdfd;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}
.testimonial img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 10px;
}
.testimonial p {
  font-style: italic;
  color: #555;
  margin-bottom: 10px;
}
.stars {
  color: #f1c40f;
}

</style>
