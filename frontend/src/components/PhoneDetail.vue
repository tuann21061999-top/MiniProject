<template>
  <div v-if="phone" class="product-detail">
    <!-- Ảnh sản phẩm -->
    <div class="image-section">
      <img :src="selectedColor?.image || phone.image" alt="product image" />
    </div>

    <div class="info-section">
      <h2>{{ phone.name }}</h2>
      <p class="brand"><b>Hãng:</b> {{ phone.brand }}</p>
      <p class="price">Giá: {{ formatPrice(finalPrice) }}</p>

      <!-- Chọn màu -->
      <div class="option" v-if="phone.colors?.length">
        <label>Màu sắc:</label>
        <div class="color-options">
          <div
            v-for="c in phone.colors"
            :key="c.name"
            class="color-circle"
            :style="{ backgroundColor: mapColor(c.name) }"
            :class="{ active: selectedColor?.name === c.name }"
            @click="selectedColor = c"
          ></div>
        </div>
      </div>

      <!-- Chọn bộ nhớ -->
      <div class="option" v-if="phone.storages?.length">
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

      <!-- Chính sách -->
      <div class="policy">
        <h4>Chính sách bảo hành</h4>
        <ul>
          <li>Bảo hành chính hãng 12 tháng</li>
          <li>1 đổi 1 trong 30 ngày nếu lỗi</li>
          <li>Hỗ trợ trả góp 0%</li>
        </ul>
      </div>

      <!-- Button -->
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
      if (!this.selectedStorage) return base;
      // Hỗ trợ cả extraPrice và priceDelta
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

        // Chọn mặc định
        if (this.phone?.colors?.length && !this.selectedColor)
          this.selectedColor = this.phone.colors[0];
        if (this.phone?.storages?.length && !this.selectedStorage)
          this.selectedStorage = this.phone.storages[0];
      } catch (err) {
        console.error("fetchPhone error:", err);
      }
    },
    ensureSelections() {
      // Đảm bảo luôn có lựa chọn để backend lưu đúng biến thể
      if (this.phone?.colors?.length && !this.selectedColor) {
        this.selectedColor = this.phone.colors[0];
      }
      if (this.phone?.storages?.length && !this.selectedStorage) {
        this.selectedStorage = this.phone.storages[0];
      }
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
        "Vàng hồng": "#B76E79",
        "Trắng ngà": "#FFFFF0",
        "Đen bóng": "#1C1C1C",
        Kem: "#FFFDD0",
      };
      return colors[colorName] || "#ccc";
    },

    // ✅ Thêm vào giỏ hàng
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
        color: this.selectedColor?.name || null,
        storage: this.selectedStorage?.size || null,
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

        // Linh hoạt đọc kết quả
        const items =
          res.data?.items ||
          res.data?.order?.items ||
          (Array.isArray(res.data) ? res.data : null);

        if (!Array.isArray(items)) {
          throw new Error(
            "API /api/orders/add phải trả về { items: [...] } hoặc { order: { items: [...] } }"
          );
        }

        // Phát sự kiện cho Cart.vue cập nhật ngay
        emitter.emit("cart-updated", items);
        // Thông báo để người dùng biết (có thể bỏ nếu bạn chỉ muốn toast ở Cart)
        alert("✅ Đã thêm vào giỏ hàng!");
      } catch (err) {
        console.error("❌ Lỗi thêm giỏ hàng:", err.response?.data || err);
        alert("❌ Thêm vào giỏ hàng thất bại!");
      } finally {
        this.isAdding = false;
      }
    },

    // ✅ Mua ngay
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
        color: this.selectedColor?.name || null,
        storage: this.selectedStorage?.size || null,
        price: this.finalPrice,
        quantity: 1,
        image: this.selectedColor?.image || this.phone.image,
      };

      this.isBuying = true;
      try {
        const res = await axios.post(
          "http://localhost:5000/api/purchases/checkout",
          {
            email: user.email,
            items: [item],
            total: this.finalPrice,
          }
        );

        if (res.data?.purchaseId) {
          this.$router.push(`/purchases/${res.data.purchaseId}`);
        } else {
          alert("❌ Không nhận được purchaseId từ server!");
        }
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
  padding: 30px;
}

.image-section img {
  width: 350px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.info-section {
  flex: 1;
}

.price {
  color: #ff6600;
  font-size: 22px;
  font-weight: bold;
  margin: 10px 0;
}

.option {
  margin: 15px 0;
}

.color-options {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.color-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: 0.2s;
}

.color-circle.active {
  border: 3px solid #ff6600;
}

.storage-options {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.storage-btn {
  padding: 8px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  background: white;
  transition: 0.2s;
}

.storage-btn.active {
  background: #ff6600;
  color: white;
  border-color: #ff6600;
}

.policy, .payment {
  margin: 20px 0;
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}

.add-cart, .buy-now {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.add-cart {
  background: #333;
  color: white;
}

.buy-now {
  background: #ff6600;
  color: white;
}
.image-section {
  width: 350px;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.image-section img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
