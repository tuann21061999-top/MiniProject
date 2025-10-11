<template>
  <div v-if="phone" class="product-detail">
    <!-- Ảnh sản phẩm -->
    <div class="image-section">
      <img :src="selectedColor?.image || phone.image" alt="product image" />
    </div>

    <!-- Thông tin -->
    <div class="info-section">
      <h2 class="title">{{ phone.name }}</h2>
      <p class="brand"><b>Hãng:</b> {{ phone.brand }}</p>
      <p class="price">💰 {{ formatPrice(finalPrice) }}</p>

      <!-- Chọn màu -->
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

      <!-- Chọn bộ nhớ -->
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
</template>

<script>
import axios from "axios";
import emitter from "../eventBus";

export default {
  name: "PhoneDetail",
  data() {
    return {
      phone: null,
      selectedColor: null,
      selectedStorage: null,
      isAdding: false,
      isBuying: false,
    };
  },
  computed: {
    finalPrice() {
      if (!this.phone) return 0;
      const base = this.phone.basePrice || 0;
      const delta =
        this.selectedStorage?.extraPrice ??
        this.selectedStorage?.priceDelta ??
        0;
      return base + Number(delta || 0);
    },
  },
  methods: {
    async fetchPhone() {
      try {
        const id = this.$route.params.id;
        const res = await axios.get(`http://localhost:5000/api/phones/${id}`);
        this.phone = res.data;

        if (this.phone?.colors?.length) this.selectedColor = this.phone.colors[0];
        if (this.phone?.storages?.length) this.selectedStorage = this.phone.storages[0];
      } catch (err) {
        console.error("❌ fetchPhone error:", err);
      }
    },
    ensureSelections() {
      if (this.phone?.colors?.length && !this.selectedColor)
        this.selectedColor = this.phone.colors[0];
      if (this.phone?.storages?.length && !this.selectedStorage)
        this.selectedStorage = this.phone.storages[0];
    },
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value || 0);
    },
    mapColor(colorName) {
      const colors = {
        Đen: "#000000",
        Trắng: "#FFFFFF",
        Xanh: "#0000FF",
        Đỏ: "#FF0000",
        Vàng: "#FFD700",
        Bạc: "#C0C0C0",
        Hồng: "#FFC0CB",
        Tím: "#800080",
        Cam: "#FFA500",
        Xám: "#808080",
        Nâu: "#A52A2A",
        "Xanh lá": "#008000",
        "Xanh dương": "#1E90FF",
        "Xanh Saphia": "#0F52BA",
        "Titan": "#B0B0B0",
        "Xanh Midnight": "#2C3E50",
        "Xanh Thủy": "#00CED1",
        "Xanh Rêu": "#556B2F",
        "Vàng Đồng": "#DAA520",
        "Vàng Hồng": "#FFB6C1",
        "Trắng Ngà": "#FFFFF0",
        "Đen Than": "#1C1C1C",
        "Xám Không Gian": "#4B4B4B",
        "Bạc Ánh Trăng": "#D3D3D3",
        "Hồng Phấn": "#FF69B4",
        "Tím Mộng Mơ": "#9370DB",
        "Cam Cháy": "#FF4500",
        "Xanh Biển": "#4682B4",
        "Xanh Lục": "#32CD32",
        "Nâu Đất": "#8B4513",
        "Vàng Chanh": "#FFFACD",
        "Vàng Kem": "#FFF8DC",
        "Trắng Bạc": "#F8F8FF",
        "Đen Nhám": "#2F2F2F",
        "Xám Bạc": "#A9A9A9",
        "Hồng Đào": "#FFB07C",
        "Tím Oải Hương": "#E6E6FA",
        "Cam San Hô": "#FF7F50",
        "Xanh Ngọc": "#00FFFF",
        "Xanh Lơ": "#ADD8E6",
        "Nâu Socola": "#D2691E",
        "Vàng Mật Ong": "#FFB300",
        "Vàng Nghệ": "#FFD700",
        "Trắng Sữa": "#FFFAF0",
        "Đen Bóng": "#0A0A0A",
        "Xám Khói": "#708090",
        "Hồng Cánh Sen": "#FF69B4",
        "Tím Thạch Anh": "#8A2BE2",
        "Cam Đất": "#FF6347",
        "Xanh Biển Sáng": "#5F9EA0",
        "Xanh Lục Nhạt": "#98FB98",
        "Nâu Vàng": "#DEB887",
        "Vàng Sáng": "#FFFF00",
        "Vàng Nhạt": "#FAFAD2",
        "Trắng Tinh Khôi": "#F5F5F5",
        "Đen Tuyền": "#121212",
        "Xám Bóng": "#BEBEBE",
        "Hồng Phấn Nhạt": "#FFB6C1",
        "Tím Nhạt": "#D8BFD8",
        "Cam Nhạt": "#FFA07A",
        "Xanh Biển Nhạt": "#AFEEEE",
        "Xanh Lục Đậm": "#006400",
        "Nâu Đậm": "#A0522D",
        "Sa Mạc": "#EDC9AF",
        "Lục Bảo": "#50C878",
      };
      return colors[colorName] || "#ccc";
    },

    async addToCart() {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("Bạn cần đăng nhập để mua hàng!");
        this.$router.push("/login");
        return;
      }

      this.ensureSelections();
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
        console.error("❌ Lỗi thêm giỏ hàng:", err.response?.data || err);
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

      this.ensureSelections();
      const item = {
        phoneId: String(this.phone._id),
        name: this.phone.name,
        color: this.selectedColor?.name,
        storage: this.selectedStorage?.size,
        price: this.finalPrice,
        quantity: 1,
        image: this.selectedColor?.image || this.phone.image,
      };

      this.isBuying = true;
      try {
        localStorage.setItem("cart", JSON.stringify({ items: [item], total: this.finalPrice }));
        this.$router.push("/purchase-detail");
      } catch (err) {
        console.error("❌ Lỗi buyNow:", err);
        alert("Mua hàng thất bại!");
      } finally {
        this.isBuying = false;
      }
    },
  },
  mounted() {
    this.fetchPhone();
  },
  watch: {
    "$route.params.id"(newId, oldId) {
      if (newId !== oldId) this.fetchPhone();
    },
  },
};
</script>

<style scoped>
.product-detail {
  display: flex;
  gap: 40px;
  padding: 40px;
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.image-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-section img {
  width: 380px;
  height: 380px;
  object-fit: contain;
  border-radius: 12px;
  background: #fafafa;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.brand {
  font-size: 16px;
  color: #666;
}

.price {
  font-size: 26px;
  font-weight: bold;
  color: #ff6600;
}

.option {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-options {
  display: flex;
  gap: 12px;
}
.color-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: 0.2s;
}
.color-circle.active {
  border: 3px solid #ff6600;
  transform: scale(1.1);
}

.storage-options {
  display: flex;
  gap: 10px;
}
.storage-btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fdfdfd;
  cursor: pointer;
  transition: 0.2s;
}
.storage-btn:hover {
  background: #f2f2f2;
}
.storage-btn.active {
  background: #ff6600;
  color: white;
  border-color: #ff6600;
}

.actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}
.add-cart, .buy-now {
  flex: 1;
  padding: 14px 20px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.25s;
}
.add-cart {
  background: #333;
  color: white;
}
.add-cart:hover {
  background: #000;
}
.buy-now {
  background: #ff6600;
  color: white;
}
.buy-now:hover {
  background: #e65c00;
}
</style>
