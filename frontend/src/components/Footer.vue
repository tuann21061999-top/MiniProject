<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Cột 1: Hotline -->
      <div class="footer-col">
        <h3>Hỗ trợ khách hàng</h3>
        <p>📞 Mua hàng: <b>1800.2097</b> (7h30 - 22h00)</p>
        <p>📞 Khiếu nại: <b>1800.2063</b> (8h00 - 21h30)</p>
        <p>✉️ Email: support@phoneshop.vn</p>
      </div>

      <!-- Cột 2: Chính sách -->
      <div class="footer-col">
        <h3>Chính sách & Hỗ trợ</h3>
        <ul>
          <li><router-link to="/policy">🚚 Giao hàng</router-link></li>
          <li><router-link to="/policy">🔄 Đổi trả</router-link></li>
          <li><router-link to="/policy">💳 Thanh toán</router-link></li>
          <li><router-link to="/policy">🔒 Bảo mật</router-link></li>
          <li><router-link to="/policy">📄 Điều khoản</router-link></li>
        </ul>
      </div>

      <!-- Cột 3: Danh mục -->
      <div class="footer-col">
        <h3>Danh mục sản phẩm</h3>
        <ul>
          <li><router-link to="/phones?brand=Apple">🍎 iPhone</router-link></li>
          <li><router-link to="/phones?brand=Samsung">📱 Samsung</router-link></li>
          <li><router-link to="/phones?brand=Xiaomi">⚡ Xiaomi</router-link></li>
          <li><router-link to="/phones?brand=OPPO">✨ OPPO</router-link></li>
          <li><router-link to="/phones?brand=Vivo">📸 Vivo</router-link></li>
        </ul>
      </div>

      <!-- Cột 4: Newsletter -->
      <div class="footer-col newsletter">
        <h3>Đăng ký nhận tin</h3>
        <p>Nhận voucher 10% cho khách hàng mới</p>
        <form @submit.prevent="subscribe">
          <input type="email" v-model="email" placeholder="Nhập email của bạn" required />
          <button type="submit">Đăng ký</button>
        </form>
        <div class="app-links">
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
          <img src="https://digitopoly.files.wordpress.com/2016/06/app-store-logo.png" alt="App Store" />
        </div>
      </div>
    </div>

    <!-- Thanh dưới cùng -->
    <div class="footer-bottom">
      <p>© 2025 Phone Shop. All rights reserved.</p>
      <div class="socials">
        <a href="#">📘</a>
        <a href="#">📸</a>
        <a href="#">🎵</a>
        <a href="#">▶️</a>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  data() {
    return {
      email: ""
    };
  },
  methods: {
    subscribe() {
      alert(`✅ Đăng ký thành công với email: ${this.email}`);
      this.email = "";
    }
  }
};
</script>

<style scoped>
.footer {
  background: #222;
  color: #fff;
  padding: 40px 20px 20px;
  font-size: 14px;
}
.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 30px;
  margin-bottom: 20px;
}
.footer h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #ff6600;
}
.footer p { margin: 6px 0; }
.footer-col ul { list-style: none; padding: 0; }
.footer-col li { margin: 6px 0; }
.footer-col a {
  color: #ddd;
  text-decoration: none;
  transition: color 0.25s;
}
.footer-col a:hover { color: #ff6600; }

/* Newsletter */
.newsletter input {
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  border: none;
}
.newsletter button {
  width: 100%;
  padding: 10px;
  background: #ff6600;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}
.newsletter button:hover { background: #e65c00; }
.app-links {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}
.app-links img { height: 40px; }

/* Footer bottom */
.footer-bottom {
  border-top: 1px solid #444;
  padding-top: 15px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.footer-bottom p { margin: 0; }
.socials {
  display: flex;
  gap: 15px;
  font-size: 20px;
}
.socials a {
  color: #fff;
  transition: color 0.3s;
}
.socials a:hover { color: #ff6600; }
</style>
