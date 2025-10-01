<template>
  <div class="auth-container">
    <form class="auth-form" @submit.prevent="register">
      <h2>Đăng ký</h2>

      <input v-model="name" type="text" placeholder="Họ và tên" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Mật khẩu" required />

      <button type="submit" class="btn-submit">Tạo tài khoản</button>

      <div class="auth-links">
        <p>Đã có tài khoản?
          <router-link to="/login">Đăng nhập</router-link>
        </p>
      </div>
    </form>
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
        alert(res.data.message);
        this.$router.push("/login"); // chuyển hướng sang login
      } catch (err) {
        alert(err.response?.data?.error || "Đăng ký thất bại");
      }
    }
  }
};
</script>


<style scoped>
/* Toàn bộ CSS giống Login.vue để đồng bộ giao diện */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background: #fff;
}

.auth-form {
  width: 100%;
  max-width: 400px;
  padding: 40px 30px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  text-align: center;
}

.auth-form h2 {
  margin-bottom: 25px;
  color: #ff6600;
}

.auth-form input {
  width: 100%;
  padding: 12px 14px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.auth-form input:focus {
  border-color: #ff6600;
  outline: none;
}

.btn-submit {
  width: 100%;
  background: #ff6600;
  color: #fff;
  border: none;
  padding: 12px;
  margin-top: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-submit:hover {
  background: #e65500;
}

.auth-links {
  margin-top: 20px;
  font-size: 14px;
}

.auth-links a {
  color: #ff6600;
  text-decoration: none;
  font-weight: 500;
}

.auth-links a:hover {
  text-decoration: underline;
}
</style>
