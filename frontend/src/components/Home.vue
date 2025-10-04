<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>📱 Phone Shop - Công nghệ trong tầm tay</h1>
        <p>Khám phá bộ sưu tập điện thoại mới nhất, giá tốt nhất.</p>
        <button @click="$router.push('/phones')">Xem sản phẩm</button>
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
      <h2>Khuyến mãi hot 🔥</h2>
      <div class="promo-list">
        <div class="promo-card" v-for="promo in promotions" :key="promo.title">
          <img :src="promo.image" :alt="promo.title" />
          <h3>{{ promo.title }}</h3>
          <p>{{ promo.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Tin tức -->
    <section class="news">
      <h2>Tin tức công nghệ</h2>
      <div class="news-list">
        <div class="news-card" v-for="news in newsList" :key="news.title">
          <img :src="news.image" :alt="news.title" />
          <h3>{{ news.title }}</h3>
          <p>{{ news.desc }}</p>
          <button @click="$router.push('/news')">Đọc thêm</button>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials">
      <h2>Khách hàng nói gì?</h2>
      <div class="testimonial-list">
        <div class="testimonial-card" v-for="t in testimonials" :key="t.name">
          <p>“{{ t.quote }}”</p>
          <h4>- {{ t.name }}</h4>
        </div>
      </div>
    </section>

    <!-- Footer -->
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
      categories: [
        { name: "iPhone", image: "https://cdn.tgdd.vn/Brand/1/logo-iphone-220x48.png" },
        { name: "Samsung", image: "https://cdn.tgdd.vn/Brand/1/logo-samsung-220x48.png" },
        { name: "Xiaomi", image: "https://cdn.tgdd.vn/Brand/1/logo-xiaomi-220x48.png" },
      ],
      promotions: [
        { title: "Sale 9.9", desc: "Giảm 30% toàn bộ sản phẩm", image: "https://picsum.photos/300/160?1" },
        { title: "Back To School", desc: "Ưu đãi cho HSSV", image: "https://picsum.photos/300/160?2" },
        { title: "Siêu Sale cuối năm", desc: "Giảm tới 50%", image: "https://picsum.photos/300/160?3" },
      ],
      newsList: [
        { title: "iPhone 17 Pro ra mắt", desc: "Siêu chip A19, camera 200MP", image: "https://picsum.photos/300/180?4" },
        { title: "Samsung S25 Ultra", desc: "Đối thủ nặng ký iPhone", image: "https://picsum.photos/300/180?5" },
      ],
      testimonials: [
        { name: "Nguyễn Văn A", quote: "Điện thoại chất lượng, giao hàng nhanh." },
        { name: "Trần Thị B", quote: "Giá rẻ hơn nhiều so với cửa hàng ngoài." },
        { name: "Lê Văn C", quote: "Hỗ trợ khách hàng rất tận tình." },
      ],
    };
  },
  methods: {
    async fetchFeaturedPhones() {
      try {
        const res = await axios.get("http://localhost:5000/api/phones");
        const allPhones = res.data;
        this.featuredPhones = allPhones.filter((p) =>
          ["iPhone 17 Pro Max", "Samsung Galaxy S25 Ultra", "Xiaomi 15 Ultra"].includes(p.name)
        );
      } catch (err) {
        console.error("❌ Lỗi load phones:", err);
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
    },
    goToCategory(brand) {
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
  padding: 0;
  background: #f7f9fc;
}

/* Hero */
.hero {
  background: url("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9") no-repeat center/cover;
  color:#e65c00;
  padding: 120px 20px;
}
.hero-content h1 {
  font-size: 50px;
  font-weight: bold;
}
.hero-content p {
  font-size: 22px;
  margin: 10px 0 20px;
}
.hero-content button {
  padding: 12px 24px;
  background: #ff6600;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}
.hero-content button:hover {
  background: #e65c00;
}

/* Categories */
.categories { margin: 40px auto; }
.category-list {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.category-card {
  background: #fff;
  border: 1px solid #eee;
  padding: 20px;
  border-radius: 12px;
  width: 200px;
  cursor: pointer;
  transition: transform 0.25s;
}
.category-card:hover { transform: translateY(-8px); }

/* Products */
.product-list {
  display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;
}
.product-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 15px;
  width: 300px;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: 0.25s;
}
.product-card img {
  width: 100%; max-height: 200px; object-fit: contain;
  margin-bottom: 12px; border-radius: 10px;
}
.product-card:hover { transform: translateY(-8px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
.price { color: #ff6600; font-weight: bold; }

/* Promo */
.promo-list { display: flex; justify-content: center; gap: 20px; }
.promo-card {
  background: #fff; padding: 15px; border-radius: 12px; width: 260px;
  transition: 0.25s; cursor: pointer;
}
.promo-card:hover { transform: scale(1.05); }

/* News */
.news-list { display: flex; justify-content: center; gap: 20px; }
.news-card {
  background: #fff; padding: 15px; border-radius: 12px; width: 280px;
}
.news-card img { width: 100%; border-radius: 10px; margin-bottom: 10px; }
.news-card button {
  margin-top: 10px; padding: 6px 12px; background: #0077b6;
  color: white; border: none; border-radius: 6px; cursor: pointer;
}
.news-card button:hover { background: #023e8a; }

/* Testimonials */
.testimonials { margin: 50px 0; }
.testimonial-list { display: flex; justify-content: center; gap: 20px; }
.testimonial-card {
  background: #fff; padding: 20px; border-radius: 12px; width: 280px;
  font-style: italic;
}
</style>
