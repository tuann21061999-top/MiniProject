<template>
  <div class="auth-container">
    <h2>Quên mật khẩu</h2>

    <!-- Nhập email -->
    <form v-if="step === 1" @submit.prevent="checkUser">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
      />
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <button type="submit">Xác nhận</button>
    </form>

    <!-- Nhập mật khẩu mới -->
    <form v-if="step === 2" @submit.prevent="resetPassword">
      <input
        v-model="newPassword"
        type="password"
        placeholder="Mật khẩu mới"
        required
      />
      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Xác nhận mật khẩu"
        required
      />
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <button type="submit">Đổi mật khẩu</button>
    </form>

    <div class="links">
      <router-link to="/login">Quay lại đăng nhập</router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ForgotPassword",
  data() {
    return {
      email: "",
      newPassword: "",
      confirmPassword: "",
      errorMsg: "",
      step: 1,
    };
  },
  methods: {
    async checkUser() {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/check-user", {
          email: this.email,
        });

        if (res.data.success) {
          this.step = 2;
          this.errorMsg = "";
        } else {
          this.errorMsg = "Email chưa được đăng ký";
        }
      } catch (err) {
        this.errorMsg = err.response?.data?.error || "Có lỗi xảy ra khi kiểm tra";
      }
    },
    async resetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.errorMsg = "Mật khẩu xác nhận không khớp";
        return;
      }

      try {
        const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
          email: this.email,
          password: this.newPassword,
        });

        alert(res.data.message || "Đổi mật khẩu thành công");
        this.$router.push("/login");
      } catch (err) {
        this.errorMsg = err.response?.data?.error || "Đổi mật khẩu thất bại";
      }
    },
  },
};
</script>


<style scoped>
.auth-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 25px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f9f9f9;
}
.auth-container h2 {
  text-align: center;
  margin-bottom: 20px;
}
.auth-container input {
  display: block;
  width: 95%;
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
button {
  width: 100%;
  padding: 10px;
  background: orangered;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background: #2980b9;
}
.error {
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
}
.links {
  margin-top: 15px;
  text-align: center;
}
</style>
