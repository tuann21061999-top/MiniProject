<template>
  <div class="cart-container">
    <h2>🛒 Giỏ hàng</h2>

    <div v-if="cart.length" class="cart-list">
      <div
        v-for="(item, index) in cart"
        :key="item.phoneId + '-' + item.color + '-' + item.storage"
        class="cart-item"
      >
        <!-- Ảnh sản phẩm -->
        <img :src="item.image" alt="Ảnh sản phẩm" class="cart-image" />

        <!-- Thông tin -->
        <div class="cart-info">
          <h3>{{ item.name }}</h3>
          <p>Màu: {{ item.color }} | Bộ nhớ: {{ item.storage }}</p>
          <p class="price">{{ formatPrice(item.price) }}</p>
        </div>

        <!-- Số lượng -->
        <div class="quantity">
          <button
            @click="changeQty(item, -1)"
            :disabled="item.quantity <= 1"
          >
            -
          </button>
          <span>{{ item.quantity }}</span>
          <button @click="changeQty(item, +1)">+</button>
        </div>

        <!-- Xoá -->
        <button class="remove" @click="removeItem(item)">❌</button>
      </div>

      <!-- Tổng tiền -->
      <div class="cart-summary">
        <p><b>Tổng tiền:</b> {{ formatPrice(totalPrice) }}</p>
        <button class="checkout" @click="checkout">✅ Đặt hàng</button>
      </div>
    </div>

    <p v-else>Giỏ hàng đang trống!</p>
  </div>
</template>

<script>
import axios from "axios";
import emitter from "../eventBus";

export default {
  name: "Cart",
  data() {
    return {
      cart: [],
      user: null,
      _onCartUpdated: null,
    };
  },
  computed: {
    totalPrice() {
      return this.cart.reduce(
        (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
        0
      );
    },
  },
  methods: {
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value || 0);
    },

    async loadCart() {
      this.user = JSON.parse(localStorage.getItem("user"));
      if (!this.user) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/orders/${this.user.email}`
        );
        this.cart = (res.data?.items || res.data?.order?.items || []);
      } catch (err) {
        console.error("❌ Lỗi load giỏ hàng:", err);
        this.cart = [];
      }
    },

    // ✅ Truyền delta đúng: -1 / +1
    async changeQty(item, delta) {
      if (!this.user || !delta) return;

      try {
        const res = await axios.put(
          "http://localhost:5000/api/orders/change-quantity",
          {
            email: this.user.email,
            phoneId: item.phoneId,
            color: item.color,
            storage: item.storage,
            delta, // -1 hoặc +1
          }
        );

        const items =
          res.data?.items ||
          res.data?.order?.items ||
          (Array.isArray(res.data) ? res.data : []);

        this.cart = items.map((p) => ({
          ...p,
          // giữ ảnh cũ nếu API không trả về
          image:
            p.image ||
            this.cart.find(
              (c) =>
                c.phoneId === p.phoneId &&
                c.color === p.color &&
                c.storage === p.storage
            )?.image ||
            item.image,
        }));
      } catch (err) {
        console.error("❌ Lỗi cập nhật số lượng:", err.response?.data || err);
      }
    },

    async removeItem(item) {
      if (!this.user) return;

      try {
        const res = await axios.delete(
          "http://localhost:5000/api/orders/remove",
          {
            data: {
              email: this.user.email,
              phoneId: item.phoneId,
              color: item.color,
              storage: item.storage,
            },
          }
        );

        const items =
          res.data?.items ||
          res.data?.order?.items ||
          (Array.isArray(res.data) ? res.data : []);

        this.cart = items.map((p) => ({
          ...p,
          image:
            p.image ||
            this.cart.find(
              (c) =>
                c.phoneId === p.phoneId &&
                c.color === p.color &&
                c.storage === p.storage
            )?.image ||
            item.image,
        }));
      } catch (err) {
        console.error("❌ Lỗi xoá sản phẩm:", err.response?.data || err);
      }
    },

    async checkout() {
      if (!this.user) {
        alert("Bạn cần đăng nhập để đặt hàng!");
        this.$router.push("/login");
        return;
      }

      if (!this.cart.length) {
        alert("Giỏ hàng trống, không thể đặt hàng!");
        return;
      }

      try {
        const res = await axios.post(
          "http://localhost:5000/api/purchases/checkout",
          {
            email: this.user.email,
            items: this.cart.map((item) => ({
              phoneId: item.phoneId,
              name: item.name,
              color: item.color,
              storage: item.storage,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
            total: this.totalPrice,
          }
        );

        if (res.data?.purchaseId) {
          this.$router.push(`/purchases/${res.data.purchaseId}`);
        } else {
          alert("❌ Không nhận được purchaseId từ server!");
        }
      } catch (err) {
        console.error("❌ Lỗi đặt hàng:", err.response?.data || err);
        alert("Đặt hàng thất bại, vui lòng thử lại!");
      }
    },
  },
  mounted() {
    this.loadCart();

    // Lắng nghe giỏ hàng cập nhật từ PhoneDetail
    this._onCartUpdated = (items) => {
      const normalized =
        items ||
        [];
      this.cart = normalized.map((p) => ({
        ...p,
        image:
          p.image ||
          this.cart.find(
            (c) =>
              c.phoneId === p.phoneId &&
              c.color === p.color &&
              c.storage === p.storage
          )?.image,
      }));
      alert("✅ Sản phẩm đã được thêm vào giỏ hàng!");
    };

    emitter.on("cart-updated", this._onCartUpdated);
  },
  beforeUnmount() {
    // Tránh leak listener khi điều hướng
    if (this._onCartUpdated) {
      emitter.off?.("cart-updated", this._onCartUpdated);
    }
  },
};
</script>





<style scoped>
.cart-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  gap: 15px;
}
.cart-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.cart-info {
  flex: 1;
}
.cart-info h3 {
  margin: 0;
  color: #333;
}
.cart-info p {
  margin: 3px 0;
  font-size: 14px;
  color: #666;
}
.price {
  color: #ff6600;
  font-weight: bold;
}
.quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}
.quantity button {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  cursor: pointer;
}
.quantity span {
  min-width: 24px;
  text-align: center;
}
.remove {
  background: red;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.remove:hover {
  background: darkred;
}
.cart-summary {
  margin-top: 20px;
  text-align: right;
}
.checkout {
  margin-top: 12px;
  padding: 10px 20px;
  background: #ff6600;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.checkout:hover {
  background: #e65500;
}
</style>
