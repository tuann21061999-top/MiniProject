<template>
  <div class="news-page">
    <!-- Banner -->
    <div class="news-hero">
      <h1>📰 Tin tức công nghệ</h1>
      <p>
        Cập nhật nhanh nhất – Mới nhất – Đặc sắc nhất về thế giới smartphone &
        công nghệ.
      </p>
    </div>

    <!-- Danh mục -->
    <div class="news-categories">
      <button
        v-for="cat in categories"
        :key="cat.key"
        :class="{ active: cat.key === activeCategory }"
        @click="activeCategory = cat.key"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- Loading hoặc Lỗi -->
    <div v-if="loading" class="message">⏳ Đang tải tin tức...</div>
    <div v-if="error" class="message error">{{ error }}</div>

    <!-- Danh sách tin tức -->
    <div v-if="!loading && !error" class="news-content">
      <!-- Tin tức nổi bật -->
      <section class="highlight">
        <h2>🔥 Tin nổi bật</h2>
        <div class="highlight-grid">
          <div
            v-for="article in featuredArticles"
            :key="article._id"
            class="highlight-card"
            @click="viewArticle(article._id)"
          >
            <img :src="article.imageUrl" :alt="article.title" />
            <div class="card-text">
              <h3>{{ article.title }}</h3>
              <p>{{ article.content.substring(0, 100) }}...</p>
              <span class="read-more">Xem chi tiết →</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Tin mới nhất -->
      <section class="latest">
        <h2>🆕 Tin mới nhất</h2>
        <div class="news-list">
          <div
            v-for="article in latestArticles"
            :key="article._id"
            class="news-item"
            @click="viewArticle(article._id)"
          >
            <img :src="article.imageUrl" :alt="article.title" />
            <div class="item-text">
              <h3>{{ article.title }}</h3>
              <p>{{ article.content.substring(0, 120) }}...</p>
              <span class="read-more">Đọc thêm →</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
// ===== FAKE API (DỮ LIỆU GIẢ) =====
// Đây là dữ liệu giả để trang web chạy mà không cần backend
const FAKE_API_DATA = [
  {
    _id: "1",
    title: "Đánh giá iPhone 16 Pro Max: Camera và AI là điểm nhấn",
    content: "Nội dung chi tiết về iPhone 16 Pro Max...",
    category: "Điện thoại",
    featured: true,
    imageUrl: "https://placehold.co/600x400/007bff/white?text=iPhone+16",
    createdAt: new Date("2025-10-22T10:00:00Z"),
  },
  {
    _id: "2",
    title: "Samsung Galaxy Z Fold 6: Liệu có đột phá?",
    content: "Nội dung chi tiết về Z Fold 6...",
    category: "Điện thoại",
    featured: true,
    imageUrl: "https://placehold.co/600x400/343a40/white?text=Z+Fold+6",
    createdAt: new Date("2025-10-21T11:00:00Z"),
  },
  {
    _id: "3",
    title: "Vì sao MacBook Air M3 là lựa chọn hàng đầu cho sinh viên?",
    content: "Nội dung chi tiết về MacBook Air M3...",
    category: "Laptop",
    featured: false,
    imageUrl: "https://placehold.co/600x400/6c757d/white?text=MacBook+Air",
    createdAt: new Date("2025-10-20T14:00:00Z"),
  },
  {
    _id: "4",
    title: "Apple Watch Series 10: Những tính năng sức khỏe đáng mong chờ",
    content: "Nội dung chi tiết về Apple Watch Series 10...",
    category: "Đồng hồ",
    featured: false,
    imageUrl: "https://placehold.co/600x400/dc3545/white?text=Apple+Watch",
    createdAt: new Date("2025-10-19T09:00:00Z"),
  },
  {
    _id: "5",
    title: "So sánh HyperOS của Xiaomi và OneUI của Samsung",
    content: "Nội dung chi tiết về HyperOS và OneUI...",
    category: "Công nghệ",
    featured: false,
    imageUrl: "https://placehold.co/600x400/fd7e14/white?text=HyperOS",
    createdAt: new Date("2025-10-18T16:00:00Z"),
  },
  {
    _id: "6",
    title: "Top 5 tựa game mobile đáng chơi nhất cuối năm 2025",
    content: "Nội dung chi tiết về game mobile...",
    category: "Giải trí",
    featured: false,
    imageUrl: "https://placehold.co/600x400/6f42c1/white?text=Game",
    createdAt: new Date("2025-10-17T11:00:00Z"),
  },
];

// Hàm giả lập gọi API
const fakeFetch = (category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (category === "Tất cả") {
        resolve(FAKE_API_DATA);
      } else {
        const filtered = FAKE_API_DATA.filter(
          (a) => a.category === category
        );
        resolve(filtered);
      }
    }, 500); // Giả lập độ trễ 0.5s
  });
};
// ===== KẾT THÚC FAKE API =====

export default {
  name: "News",
  data() {
    return {
      loading: false,
      error: null,
      activeCategory: "Tất cả",
      articles: [],
      categories: [
        { key: "Tất cả", name: "Tất cả", icon: "🌐" },
        { key: "Điện thoại", name: "Điện thoại", icon: "📱" },
        { key: "Laptop", name: "Laptop", icon: "💻" },
        { key: "Đồng hồ", name: "Đồng hồ", icon: "⌚" },
        { key: "Công nghệ", name: "Công nghệ", icon: "🖥️" },
        { key: "Giải trí", name: "Giải trí", icon: "🎮" },
      ],
    };
  },
  computed: {
    // Lọc 2 bài nổi bật
    featuredArticles() {
      return this.articles
        .filter((a) => a.featured)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 2);
    },
    // Lọc các bài còn lại
    latestArticles() {
      return this.articles
        .filter((a) => !a.featured)
        .sort((a, b) => b.createdAt - a.createdAt);
    },
  },
  watch: {
    // Tự động gọi lại API (giả) khi đổi danh mục
    activeCategory() {
      this.fetchNews();
    },
  },
  created() {
    this.fetchNews();
  },
  methods: {
    async fetchNews() {
      this.loading = true;
      this.error = null;
      try {
        // Gọi hàm FAKE_API
        const data = await fakeFetch(this.activeCategory);
        this.articles = data;
      } catch (err) {
        this.error = "❌ Không thể tải tin tức. Vui lòng thử lại sau.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    viewArticle(id) {
      // Vì là FAKE_API nên chúng ta không thể chuyển trang
      // Bạn có thể alert hoặc chuyển đến router /news/:id
      // Nhưng router /news/:id sẽ không hoạt động
      alert(`Bạn đang xem bài viết (ID giả): ${id}\nĐể xem chi tiết, chúng ta cần kết nối API thật.`);
      // Hoặc nếu bạn vẫn muốn nó chuyển trang (dù sẽ lỗi):
      // this.$router.push(`/news/${id}`);
    },
  },
};
</script>

<style scoped>
.news-page {
  font-family: "Segoe UI", sans-serif;
  color: #333;
  padding-bottom: 40px;
}

/* Banner */
.news-hero {
  background: linear-gradient(135deg, #0066cc, #3399ff);
  color: white;
  text-align: center;
  padding: 60px 20px;
  border-radius: 0 0 40px 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
}
.news-hero h1 {
  font-size: 40px;
  margin-bottom: 10px;
}
.news-hero p {
  font-size: 18px;
}

/* Categories */
.news-categories {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 30px 0;
  flex-wrap: wrap;
}
.news-categories button {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: #f8f8f8;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 500;
}
.news-categories button:hover {
  background: #eee;
  border-color: #ccc;
}
.news-categories .active {
  background: #0066cc;
  color: white;
  border-color: #0066cc;
}

.message {
  text-align: center;
  font-size: 18px;
  padding: 40px;
  font-weight: 500;
}
.message.error {
  color: #dc3545;
}

/* Content Layout */
.news-content {
  max-width: 1200px;
  margin: auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr; /* Đổi thành 1 cột */
  gap: 30px;
}

/* Highlight */
.highlight h2,
.latest h2 {
  color: #0066cc;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}
.highlight-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(300px, 1fr)
  ); /* Responsive */
  gap: 20px;
}
.highlight-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.highlight-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}
.highlight-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}
.card-text {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.card-text h3 {
  margin: 0 0 10px;
  font-size: 18px;
  flex-grow: 1;
}
.card-text p {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
}
.read-more {
  color: #0066cc;
  text-decoration: none;
  font-weight: bold;
  margin-top: auto;
}

/* Latest news */
.news-list {
  display: grid;
  grid-template-columns: 1fr; /* 1 cột cho dễ đọc */
  gap: 20px;
}
.news-item {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.news-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
}
.news-item img {
  width: 200px; /* Cố định chiều rộng ảnh */
  height: 150px;
  object-fit: cover;
}
.item-text {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.item-text h3 {
  margin: 0 0 8px;
  font-size: 17px;
}
.item-text p {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
}

/* Responsive cho bố cục chính */
@media (min-width: 1024px) {
  .news-content {
    grid-template-columns: 3fr 1fr; /* Layout 2 cột trên desktop */
  }
  .highlight {
    grid-column: 1 / 2; /* Tin nổi bật ở cột 1 */
  }
  .latest {
    grid-column: 2 / 3; /* Tin mới ở cột 2 */
    grid-row: 1 / 2; /* Đẩy lên hàng đầu */
  }
  .latest h2 {
    margin-top: 0;
  }
  .news-item {
    flex-direction: column; /* Xếp dọc lại ở sidebar */
  }
  .news-item img {
    width: 100%;
    height: 150px;
  }
}
</style>