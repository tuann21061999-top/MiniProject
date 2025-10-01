<template>
  <div class="auth-container">
    <h2>Đăng nhập</h2>
    <form @submit.prevent="login">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Mật khẩu"
        required
      />
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <button type="submit">Đăng nhập</button>
    </form>

    <div class="links">
      <router-link to="/register">Chưa có tài khoản? Đăng ký</router-link>
      <router-link to="/forgot-password">Quên mật khẩu?</router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      errorMsg: ""
    };
  },
  methods: {
    async login() {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: this.email,
          password: this.password,
        });

        // Thông báo
        alert(res.data.message || "Đăng nhập thành công");

        // 🔑 Lưu thông tin user vào localStorage (Navbar sẽ đọc)
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Chuyển về trang chủ
        this.$router.push("/").then(() => {
      // Sau khi đã chuyển trang thì mới reload
        window.location.reload();
        });
      } catch (err) {
        this.errorMsg = err.response?.data?.error || "Đăng nhập thất bại";
      }
    },
  },
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  text-align: center;
}

.auth-container h2 {
  margin-bottom: 20px;
  color: #ff6600;
}

.auth-container form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.auth-container input {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}

.auth-container button {
  background-color: #ff6600;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.auth-container button:hover {
  background-color: #e65c00;
}

.error {
  color: red;
  font-size: 14px;
  margin-top: -5px;
}

.links {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.links a {
  color: #ff6600;
  text-decoration: none;
}
.links a:hover {
  text-decoration: underline;
}
</style>
