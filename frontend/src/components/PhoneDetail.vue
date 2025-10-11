<template>
  <div>
    <!-- ========== PHẦN THÔNG TIN ĐIỆN THOẠI ========== -->
    <div v-if="phone" class="product-detail">
      <!-- Ảnh -->
      <div class="image-section">
        <img :src="selectedColor?.image || phone.image" alt="product image" />
      </div>

      <!-- Thông tin -->
      <div class="info-section">
        <h2 class="title">{{ phone.name }}</h2>
        <p class="brand"><b>Hãng:</b> {{ phone.brand }}</p>
        <p class="price">💰 {{ formatPrice(finalPrice) }}</p>

        <!-- Màu -->
        <div v-if="phone.colors?.length" class="option">
          <label>Màu sắc:</label>
          <div class="color-options">
            <div
              v-for="c in phone.colors"
              :key="c.name"
              class="color-circle"
              :style="{ backgroundColor: mapColor(c.name) }"
              :class="{ active: selectedColor?.name === c.name }"
              @click="selectedColor = c"
              :title="c.name"
            ></div>
          </div>
        </div>

        <!-- Bộ nhớ -->
        <div v-if="phone.storages?.length" class="option">
          <label>Bộ nhớ trong:</label>
          <div class="storage-options">
            <button
              v-for="s in phone.storages"
              :key="s.size"
              class="storage-btn"
              :class="{ active: selectedStorage?.size === s.size }"
              @click="selectedStorage = s"
            >
              {{ s.size }}
            </button>
          </div>
        </div>

        <!-- Nút hành động -->
        <div class="actions">
          <button class="add-cart" :disabled="isAdding" @click="addToCart">
            🛒 Thêm vào giỏ hàng
          </button>
          <button class="buy-now" :disabled="isBuying" @click="buyNow">
            ⚡ Mua ngay
          </button>
        </div>
      </div>
    </div>

    <p v-else class="loading">⏳ Đang tải thông tin sản phẩm...</p>

    <!-- ========== PHẦN CẤU HÌNH NGẮN GỌN ========== -->
    <div v-if="phone?.specs" class="specs-section">
      <Specs :specsId="phone.specs" :limitTo="'camera'" />
      <button class="view-more-btn" @click="showPopup = true">
        🔍 Xem cấu hình chi tiết
      </button>
    </div>

    <!-- ✅ PHẦN REVIEW -->
    <!-- ✅ THÊM điều kiện -->
<Review v-if="phone" :phoneId="phone._id" :phoneName="phone.name" />



    <!-- ========== POPUP CẤU HÌNH ĐẦY ĐỦ ========== -->
    <transition name="fade">
      <div v-if="showPopup" class="popup-overlay" @click.self="closePopup">
        <div class="popup-content">
          <button class="close-btn" @click="closePopup">✖</button>
          <h3>📖 Cấu hình chi tiết</h3>
          <Specs :specsId="phone.specs" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import emitter from "../eventBus";
import Specs from "./Specs.vue";
import Review from "./Review.vue";

export default {
  name: "PhoneDetail",
  components: { Specs, Review },
  data() {
    return {
      phone: null,
      selectedColor: null,
      selectedStorage: null,
      isAdding: false,
      isBuying: false,
      showPopup: false,
    };
  },
  computed: {
    finalPrice() {
      if (!this.phone) return 0;
      const base = this.phone.basePrice || 0;
      const delta = this.selectedStorage?.extraPrice || 0;
      return base + delta;
    },
  },
  methods: {
    async fetchPhone() {
      try {
        const id = this.$route.params.id;
        if (!id) return;
        const res = await axios.get(`http://localhost:5000/api/phones/${id}`);
        this.phone = res.data;

        if (this.phone?.colors?.length)
          this.selectedColor = this.phone.colors[0];
        if (this.phone?.storages?.length)
          this.selectedStorage = this.phone.storages[0];
      } catch (err) {
        console.error("❌ fetchPhone error:", err);
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value || 0);
    },
    mapColor(name) {
      const colors = {
        Đen: "#000",
        Trắng: "#fff",
        Xanh: "#00f",
        Đỏ: "#f00",
        Vàng: "#ff0",
        Bạc: "#ccc",
        Hồng: "#ffc0cb",
        Xám: "#888",
        Tím: "#800080",
        Cam: "#ffa500",
        Nâu: "#a52a2a",
        "Xanh Lá": "#008000",
        "Xanh Saphie": "#0f52ba",
        "Xanh Dương": "#0000cd",
        "Kem": "#f5f5dc",
        "Titan": "#b0b0b0",
        "Nâu Vàng": "#d2b48c",
        "Sa Mạc": "#edc9af",
        "Lục Bảo": "#50c878",
      };
      return colors[name] || "#ccc";
    },
    closePopup() {
      this.showPopup = false;
    },
    async addToCart() {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("Bạn cần đăng nhập để mua hàng!");
        this.$router.push("/login");
        return;
      }
      const item = {
        phoneId: String(this.phone._id),
        name: this.phone.name,
        color: this.selectedColor?.name,
        storage: this.selectedStorage?.size,
        price: this.finalPrice,
        quantity: 1,
        image: this.selectedColor?.image || this.phone.image,
      };
      this.isAdding = true;
      try {
        const res = await axios.post("http://localhost:5000/api/orders/add", {
          email: user.email,
          item,
        });
        const items =
          res.data?.items ||
          res.data?.order?.items ||
          (Array.isArray(res.data) ? res.data : []);
        emitter.emit("cart-updated", items);
        alert("✅ Đã thêm vào giỏ hàng!");
      } catch (err) {
        console.error("❌ addToCart error:", err);
        alert("❌ Thêm vào giỏ hàng thất bại!");
      } finally {
        this.isAdding = false;
      }
    },
    async buyNow() {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("Bạn cần đăng nhập để mua hàng!");
        this.$router.push("/login");
        return;
      }
      const item = {
        phoneId: String(this.phone._id),
        name: this.phone.name,
        color: this.selectedColor?.name,
        storage: this.selectedStorage?.size,
        price: this.finalPrice,
        quantity: 1,
        image: this.selectedColor?.image || this.phone.image,
      };
      localStorage.setItem(
        "cart",
        JSON.stringify({ items: [item], total: this.finalPrice })
      );
      this.$router.push("/purchase-detail");
    },
  },
  mounted() {
    this.fetchPhone();
  },
};
</script>

<style scoped>
/* ========== PHẦN SẢN PHẨM ========== */
.product-detail {
  display: flex;
  gap: 48px;
  padding: 50px;
  max-width: 1200px;
  margin: 50px auto;
  background: linear-gradient(135deg, #ffffff, #fafafa);
  border-radius: 22px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
  animation: fadeSlideIn 0.6s ease-out;
}

/* Ảnh sản phẩm với hiệu ứng parallax nhẹ */
.image-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
}
.image-section img {
  width: 420px;
  height: 420px;
  object-fit: contain;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
  transform-style: preserve-3d;
  transition: transform 0.5s ease, box-shadow 0.4s ease;
}
.image-section img:hover {
  transform: rotateY(10deg) rotateX(4deg) scale(1.05);
  box-shadow: 0 15px 40px rgba(255, 102, 0, 0.35);
}

/* ========== THÔNG TIN ========== */
.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.title {
  font-size: 34px;
  font-weight: 700;
  color: #333;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}
.title:hover {
  color: #ff6600;
}
.brand {
  font-size: 18px;
  color: #555;
}
.price {
  font-size: 30px;
  font-weight: 700;
  color: #ff6600;
  text-shadow: 0 1px 3px rgba(255, 102, 0, 0.2);
}

/* ========== MÀU SẮC & BỘ NHỚ ========== */
.option {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}
.color-options {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.color-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #ddd;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
}
.color-circle:hover {
  transform: scale(1.15);
  box-shadow: 0 5px 12px rgba(255, 102, 0, 0.4);
}
.color-circle.active {
  border: 3px solid #ff6600;
  transform: scale(1.2);
  box-shadow: 0 4px 14px rgba(255, 102, 0, 0.6);
}

/* Bộ nhớ */
.storage-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.storage-btn {
  padding: 8px 18px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: #fdfdfd;
  font-weight: 500;
  cursor: pointer;
  transition: 0.25s ease;
}
.storage-btn:hover {
  background: #fff1e0;
  border-color: #ffae66;
}
.storage-btn.active {
  background: linear-gradient(135deg, #ff6600, #ff9966);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
}

/* ========== NÚT HÀNH ĐỘNG ========== */
.actions {
  display: flex;
  gap: 18px;
  margin-top: 30px;
}
.add-cart,
.buy-now {
  flex: 1;
  padding: 14px 0;
  font-size: 17px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}
.add-cart {
  background: #222;
  color: white;
}
.add-cart:hover {
  background: #000;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.buy-now {
  background: linear-gradient(135deg, #ff6600, #ff9966);
  color: white;
}
.buy-now:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 18px rgba(255, 102, 0, 0.3);
}

/* ========== CẤU HÌNH NỔI BẬT ========== */
.specs-section {
  margin-top: 60px;
  text-align: center;
  animation: fadeSlideUp 0.6s ease;
}
.view-more-btn {
  background: linear-gradient(135deg, #ff6600, #ff9933);
  color: #fff;
  border: none;
  padding: 12px 30px;
  font-size: 17px;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 18px;
  font-weight: 600;
  transition: all 0.3s ease;
}
.view-more-btn:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 5px 15px rgba(255, 102, 0, 0.35);
}

/* ========== POPUP ========== */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  animation: fadeInOverlay 0.3s ease;
}

.popup-content {
  position: relative;
  background: linear-gradient(180deg, #ffffff, #fdfdfd);
  border-radius: 20px;
  padding: 55px 45px 45px;
  width: 90%;
  max-width: 950px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  animation: zoomIn 0.4s ease;
  scroll-behavior: smooth;
  border: 2px solid rgba(255, 102, 0, 0.2);
}

/* ❌ Nút đóng */
.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 10000;
  background: linear-gradient(135deg, #ff6600, #ff9966);
  color: #fff;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(255, 102, 0, 0.4);
  transition: all 0.25s ease;
}
.close-btn:hover {
  background: linear-gradient(135deg, #ff3300, #ff6600);
  transform: rotate(90deg) scale(1.1);
}

/* ========== HIỆU ỨNG ========== */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
