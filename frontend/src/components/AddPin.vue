<template>
  <div class="add-pin">
    <h2 class="title">🔒 Thiết lập mã PIN thanh toán</h2>

    <div class="card">
      <p class="desc">
        Nhập mã PIN (4–6 chữ số) để bảo mật các thanh toán online.<br />
        Mã PIN này sẽ được yêu cầu khi bạn thực hiện thanh toán không dùng tiền mặt.
      </p>

      <div class="input-group">
        <input
          type="password"
          v-model="pin1"
          maxlength="6"
          placeholder="🔑 Nhập mã PIN"
        />
        <input
          type="password"
          v-model="pin2"
          maxlength="6"
          placeholder="🔁 Nhập lại mã PIN"
        />
      </div>

      <div class="btn-group">
        <button class="btn-save" @click="savePin">💾 Lưu mã PIN</button>
        <button class="btn-back" @click="$router.push('/profile')">↩️ Quay lại Hồ sơ</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  name: "AddPin",
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || {},
      pin1: "",
      pin2: "",
    };
  },
  methods: {
    async savePin() {
      if (!this.pin1 || this.pin1.length < 4 || this.pin1.length > 6)
        return Swal.fire("⚠️ Lỗi", "Mã PIN phải có 4–6 chữ số!", "warning");
      if (this.pin1 !== this.pin2)
        return Swal.fire("⚠️ Lỗi", "Mã PIN nhập lại không khớp!", "error");

      try {
        await axios.post("http://localhost:5000/api/pins/set", {
          email: this.user.email,
          pin: this.pin1,
        });

        Swal.fire({
          title: "✅ Thành công!",
          text: "Mã PIN của bạn đã được lưu thành công!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#ff6600",
        }).then(() => {
          this.$router.push("/profile");
        });
      } catch (err) {
        console.error("❌ Lỗi khi lưu PIN:", err);
        Swal.fire("❌ Lỗi", "Không thể lưu mã PIN. Thử lại sau!", "error");
      }
    },
  },
};
</script>

<style scoped>
/* ==== Bố cục tổng thể ==== */
.add-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(180deg, #fff, #fff8f2);
  min-height: 100vh;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #ff6600;
  margin-bottom: 25px;
  letter-spacing: 0.3px;
}

.card {
  background: #fff;
  max-width: 420px;
  width: 100%;
  border-radius: 16px;
  padding: 30px 26px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(255, 102, 0, 0.15);
}

.desc {
  color: #555;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* ==== Input ==== */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  border: 2px solid #eee;
  border-radius: 12px;
  text-align: center;
  outline: none;
  transition: all 0.25s ease;
  background: #fafafa;
}
input:focus {
  border-color: #ff944d;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 148, 77, 0.15);
}

/* ==== Nút hành động ==== */
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.btn-save,
.btn-back {
  width: 100%;
  padding: 14px;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s ease;
}

.btn-save {
  background: linear-gradient(135deg, #ff6600, #ff944d);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 102, 0, 0.25);
}
.btn-save:hover {
  background: linear-gradient(135deg, #e65c00, #ff7a1a);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 102, 0, 0.35);
}

.btn-back {
  background: #ddd;
  color: #333;
}
.btn-back:hover {
  background: #ccc;
  transform: translateY(-1px);
}

/* ==== Hiệu ứng chuyển động ==== */
.card,
input,
.btn-save,
.btn-back {
  transition: all 0.25s ease;
}
</style>
