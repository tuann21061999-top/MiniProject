<template>
  <div class="news-page">
    <!-- Banner -->
    <div class="news-hero">
      <h1>📰 Tin tức công nghệ</h1>
      <p>Cập nhật nhanh nhất – Mới nhất – Đặc sắc nhất về thế giới smartphone & công nghệ.</p>
    </div>

    <!-- Danh mục -->
    <div class="news-categories">
      <button class="active">📱 Điện thoại</button>
      <button>💻 Laptop</button>
      <button>⌚ Đồng hồ thông minh</button>
      <button>🖥️ Công nghệ mới</button>
      <button>🎮 Giải trí</button>
    </div>

    <!-- Tin tức nổi bật -->
    <section class="highlight">
      <h2>🔥 Tin nổi bật</h2>
      <div class="highlight-grid">
        <div class="highlight-card">
          <img src="https://cdn.tgdd.vn/Files/2024/05/25/iphone16.jpg" alt="iPhone 16" />
          <div class="card-text">
            <h3>Apple hé lộ iPhone 16 với thiết kế hoàn toàn mới</h3>
            <p>Siêu phẩm iPhone 16 dự kiến ra mắt cuối năm nay, với viền siêu mỏng, chip A18 và camera AI vượt trội...</p>
            <a href="#">Xem chi tiết →</a>
          </div>
        </div>
        <div class="highlight-card">
          <img src="https://cdn.tgdd.vn/Files/2024/05/25/samsungfold.jpg" alt="Samsung Fold" />
          <div class="card-text">
            <h3>Samsung Galaxy Z Fold6: Bước tiến mới của điện thoại gập</h3>
            <p>Mẫu flagship màn hình gập vừa được Samsung công bố với độ bền cao hơn và giá thành cạnh tranh hơn...</p>
            <a href="#">Xem chi tiết →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Danh sách tin tức -->
    <section class="latest">
      <h2>🆕 Tin mới nhất</h2>
      <div class="news-list">
        <div class="news-item" v-for="(news, index) in newsList" :key="index">
          <img :src="news.img" :alt="news.title" />
          <div class="item-text">
            <h3>{{ news.title }}</h3>
            <p>{{ news.summary }}</p>
            <a href="#">Đọc thêm →</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "News",
  data() {
    return {
      newsList: [
        {
          title: "OPPO Reno12 chính thức ra mắt với camera AI siêu đỉnh",
          summary:
            "OPPO Reno12 hứa hẹn bùng nổ phân khúc tầm trung nhờ camera AI chụp đêm cực tốt cùng sạc nhanh 80W.",
          img: "https://cdn.tgdd.vn/Files/2024/05/25/opporeno12.jpg",
        },
        {
          title: "Xiaomi công bố HyperOS 2.0 với nhiều tính năng độc đáo",
          summary:
            "Bản cập nhật HyperOS mới của Xiaomi mang lại hiệu năng vượt trội, hỗ trợ đồng bộ mạnh mẽ giữa điện thoại và IoT.",
          img: "https://cdn.tgdd.vn/Files/2024/05/25/xiaomihyperos.jpg",
        },
        {
          title: "Realme GT Neo6 ra mắt: cấu hình khủng, giá rẻ bất ngờ",
          summary:
            "Realme tiếp tục gây sốc khi tung Neo6 với chip Snapdragon 8s Gen 3, màn hình 144Hz và giá chỉ từ 7 triệu.",
          img: "https://cdn.tgdd.vn/Files/2024/05/25/realmegt.jpg",
        },
        {
          title: "Google Pixel 9 lộ diện: thiết kế tối giản, AI đỉnh cao",
          summary:
            "Pixel 9 dự kiến sẽ trở thành đối thủ trực tiếp của iPhone 16 nhờ chip Tensor G4 và AI hỗ trợ toàn diện.",
          img: "https://cdn.tgdd.vn/Files/2024/05/25/pixel9.jpg",
        },
        {
          title: "Sony Xperia Pro-II: chiếc điện thoại dành cho dân làm phim",
          summary:
            "Sony tiếp tục khẳng định vị thế khi ra mắt Xperia Pro-II với khả năng quay 8K và ống kính Zeiss.",
          img: "https://cdn.tgdd.vn/Files/2024/05/25/sonyxperia.jpg",
        },
      ],
    };
  },
};
</script>

<style scoped>
.news-page {
  font-family: "Segoe UI", sans-serif;
  color: #333;
}

/* Banner */
.news-hero {
  background: linear-gradient(135deg, #0066cc, #3399ff);
  color: white;
  text-align: center;
  padding: 60px 20px;
  border-radius: 0 0 40px 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
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
  border: none;
  background: #eee;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
}
.news-categories button:hover {
  background: #ddd;
}
.news-categories .active {
  background: #0066cc;
  color: white;
}

/* Highlight */
.highlight {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}
.highlight h2 {
  color: #0066cc;
  margin-bottom: 20px;
}
.highlight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.highlight-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}
.highlight-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}
.card-text {
  padding: 15px;
}
.card-text h3 {
  margin: 0 0 10px;
  font-size: 18px;
}
.card-text a {
  color: #0066cc;
  text-decoration: none;
  font-weight: bold;
}

/* Latest news */
.latest {
  max-width: 1000px;
  margin: auto;
  padding: 40px 20px;
}
.latest h2 {
  color: #0066cc;
  margin-bottom: 20px;
}
.news-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.news-item {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.news-item img {
  width: 40%;
  object-fit: cover;
}
.item-text {
  padding: 15px;
}
.item-text h3 {
  margin: 0 0 10px;
  font-size: 18px;
}
.item-text a {
  color: #0066cc;
  text-decoration: none;
  font-weight: bold;
}
</style>
