<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <form class="auth-form" @submit.prevent="register">
        <h2>📝 Đăng ký</h2>

        <input v-model="name" type="text" placeholder="👤 Họ và tên" required />
        <input v-model="email" type="email" placeholder="📧 Email" required />
        <input v-model="password" type="password" placeholder="🔒 Mật khẩu" required />

        <button type="submit" class="btn-submit">🚀 Tạo tài khoản</button>

        <div class="auth-links">
          <p>Đã có tài khoản?
            <router-link to="/login">🔑 Đăng nhập</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Register",
  data() {
    return {
      name: "",
      email: "",
      password: ""
    };
  },
  methods: {
    async register() {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/register", {
          name: this.name,
          email: this.email,
          password: this.password,
        });
        alert(res.data.message || "Đăng ký thành công ✅");
        this.$router.push("/login");
      } catch (err) {
        alert(err.response?.data?.error || "❌ Đăng ký thất bại");
      }
    }
  }
};
</script>

<style scoped>
/* 🌈 Background gradient full màn hình */
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #ff9966, #ff5e62);
  animation: bg-change 8s infinite alternate;
}

@keyframes bg-change {
  0% { background: linear-gradient(135deg, #ff9966, #ff5e62); }
  100% { background: linear-gradient(135deg, #667eea, #764ba2); }
}

/* 📦 Form container */
.auth-container {
  max-width: 420px;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 40px 35px; /* 👉 tăng padding ngang để input thoáng */
  box-shadow: 0 12px 28px rgba(0,0,0,0.25);
  animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-form h2 {
  margin-bottom: 25px;
  color: #ff6600;
  font-size: 24px;
  font-weight: 700;
}

/* Input căng full width */
.auth-form input {
  width: 100%;              /* full chiều ngang */
  padding: 14px 16px;       /* padding đều hơn */
  margin: 12px 0;           /* chỉ cách trên dưới */
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;   /* 👉 đảm bảo không bị tràn khi có padding */
  transition: border-color 0.3s, box-shadow 0.3s;
}
.auth-form input:focus {
  border-color: #ff6600;
  box-shadow: 0 0 10px rgba(255,102,0,0.5);
  outline: none;
}

/* Nút submit cũng full width */
.btn-submit {
  width: 100%;
  background: linear-gradient(135deg, #ff6600, #ff9966);
  color: #fff;
  border: none;
  padding: 14px;
  margin-top: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
  box-sizing: border-box; /* ✅ giữ cân đối */
}
.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(255,102,0,0.4);
}

/* Links */
.auth-links {
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
}
.auth-links a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}
.auth-links a:hover {
  color: #ff6600;
  text-decoration: underline;
}
</style>

