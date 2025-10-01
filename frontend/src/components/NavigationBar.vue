<template>
  <nav class="navbar">
    <!-- Logo -->
    <router-link to="/" class="logo">📱 PhoneShop</router-link>

    <!-- Menu chính -->
    <ul class="nav-links">
      <li><router-link to="/">Trang chủ</router-link></li>
      <li><router-link to="/phones">Điện thoại</router-link></li>
      <li><router-link to="/promotions">Khuyến mãi</router-link></li>
      <li><router-link to="/news">Tin tức</router-link></li>
      <li><router-link to="/contact">Liên hệ</router-link></li>
      <li><router-link to="/policy">Chính sách</router-link></li>
    </ul>

    <!-- Bên phải -->
    <div class="right-section">
      <!-- Ô tìm kiếm -->
      <div class="search-box" ref="searchBox">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm sản phẩm..."
          @input="onInput"
          @keyup.enter="search"
        />
        <button @click="search">🔍</button>

        <!-- Gợi ý -->
        <ul v-if="suggestions.length && showSuggestions" class="suggestions">
          <li v-for="item in suggestions" :key="item._id" @click="goToPhone(item)">
            <img :src="item.image" alt="product" class="suggestion-img" />
            <div class="suggestion-info">
              <span class="suggestion-name">
                {{ item.name || item.title || item.phoneName || "Không có tên" }}
              </span>
              <span class="suggestion-price">{{ formatPrice(item.basePrice) }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Giỏ hàng -->
      <div class="cart-box">
        <router-link to="/cart" class="cart-btn">
          🛒 ({{ cartCount }})
        </router-link>
      </div>

      <!-- Auth -->
      <div class="auth-section">
        <template v-if="!user">
          <router-link to="/login" class="btn-login">Đăng nhập</router-link>
          <router-link to="/register" class="btn-register">Đăng ký</router-link>
        </template>
        <template v-else>
          <router-link to="/profile" class="user-name">
            👤 Xin chào, {{ user.name }}
          </router-link>
          <button @click="logout" class="btn-logout">Đăng xuất</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from "axios";
import emitter from "../eventBus";

export default {
  name: "NavigationBar",
  data() {
    return {
      searchQuery: "",
      user: null,
      suggestions: [],
      phonesCache: null,
      showSuggestions: false,
      debounceTimer: null,
      cartCount: 0,
    };
  },
  mounted() {
    const savedUser = localStorage.getItem("user");
    if (savedUser) this.user = JSON.parse(savedUser);

    this.loadCartCount();

    emitter.on("cart-updated", (newCart) => {
      this.cartCount = newCart.length;
    });

    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    emitter.off("cart-updated");
  },
  methods: {
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },

    async loadCartCount() {
      if (!this.user) {
        this.cartCount = 0;
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/${this.user.email}`);
        this.cartCount = res.data?.items?.length || 0;
      } catch (err) {
        console.error("❌ Lỗi lấy giỏ hàng:", err);
        this.cartCount = 0;
      }
    },

    async ensurePhonesCache() {
      if (this.phonesCache) return;
      try {
        const res = await axios.get("http://localhost:5000/api/phones");
        console.log("📦 Phones data:", res.data); // log dữ liệu API
        this.phonesCache = res.data || [];
      } catch (err) {
        console.error("Không lấy được phones:", err);
        this.phonesCache = [];
      }
    },

    onInput() {
      this.showSuggestions = true;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.fetchSuggestions();
      }, 200);
    },

    async fetchSuggestions() {
      const q = this.searchQuery.trim();
      if (!q) {
        this.suggestions = [];
        return;
      }
      await this.ensurePhonesCache();
      const lc = q.toLowerCase();
      this.suggestions = this.phonesCache
        .filter((p) => p.name && p.name.toLowerCase().includes(lc))
        .slice(0, 7);

      console.log("🔎 Suggestions:", this.suggestions);
    },

    search() {
      const q = this.searchQuery.trim();
      if (!q) return;
      this.$router.push({ path: "/phones", query: { q } });
      this.showSuggestions = false;
    },

    goToPhone(phone) {
      this.$router.push(`/phones/${phone._id}`);
      this.suggestions = [];
      this.searchQuery = "";
      this.showSuggestions = false;
    },

    handleClickOutside(event) {
      const box = this.$refs.searchBox;
      if (!box) return;
      if (!box.contains(event.target)) {
        this.showSuggestions = false;
      }
    },

    logout() {
      localStorage.removeItem("user");
      this.user = null;
      this.cartCount = 0;
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
/* Navbar */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e1e1e;
  padding: 12px 30px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.logo {
  font-size: 22px;
  font-weight: bold;
  color: #ff6600;
  text-decoration: none;
}
.logo:hover {
  color: #ff8533;
}

/* Menu chính */
.nav-links {
  list-style: none;
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0;
}
.nav-links li {
  display: flex;
  align-items: center;
}
.nav-links a {
  color: white;
  text-decoration: none;
  padding: 10px 18px;
  font-size: 15px;
  transition: all 0.3s;
  border-radius: 6px;
}
.nav-links a:hover {
  background: #333;
  color: #ff6600;
}

/* Right section */
.right-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Search */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 4px 8px;
}
.search-box input {
  border: none;
  outline: none;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 14px;
}
.search-box button {
  background: #ff6600;
  border: none;
  padding: 6px 12px;
  margin-left: 5px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.3s;
}
.search-box button:hover {
  background: #e65500;
}

/* Gợi ý sản phẩm */
.suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  z-index: 1500;
  max-height: 280px;
  overflow-y: auto;
}
.suggestions li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f1f1f1;
}
.suggestions li:hover {
  background: #f9f9f9;
}
.suggestion-img {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}
.suggestion-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.suggestion-name {
  font-weight: 500;
  color: #222;
}
.suggestion-price {
  font-size: 13px;
  color: #ff6600;
  font-weight: bold;
}

/* Giỏ hàng */
.cart-btn {
  background: #ff6600;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  text-decoration: none;
  font-weight: bold;
}
.cart-btn:hover {
  background: #e65500;
}

/* Auth */
.auth-section {
  display: flex;
  align-items: center;
  gap: 10px;
}
.auth-section a {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.3s;
}
.btn-login {
  background: #444;
  color: #fff;
}
.btn-login:hover {
  background: #666;
}
.btn-register {
  background: #ff6600;
  color: #fff;
}
.btn-register:hover {
  background: #e65500;
}
.user-name {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}
.btn-logout {
  background: #ff3333;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-logout:hover {
  background: #cc0000;
}

/* Responsive */
@media (max-width: 768px) {
  .search-box {
    width: 220px;
  }
}
</style>
