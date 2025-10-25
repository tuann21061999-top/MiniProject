<template>
  <div class="profile">
    <h2 class="title">👤 Thông tin cá nhân</h2>

    <!-- 🔹 Thông tin cơ bản -->
    <div class="info card">
      <div class="info-header">
        <div>
          <p><b>Tên người dùng:</b> {{ user.name }}</p>
          <p><b>Email:</b> {{ user.email }}</p>
          <p v-if="user.phone"><b>Số điện thoại:</b> {{ user.phone }}</p>
        </div>

        <div class="info-actions">
          <button class="btn-action" @click="openChangePassword">🔐 Đổi mật khẩu</button>
          <button class="btn-action" @click="openLinkPhone">
            {{ user.phone ? "📱 Cập nhật SĐT" : "📱 Liên kết SĐT" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 📍 Quản lý địa chỉ -->
    <div class="section card address-section">
      <AddressManager />
    </div>

    <!-- 💳 Quản lý phương thức thanh toán -->
    <div class="section card payment-section">
      <PaymentManager />
    </div>

    <!-- 🔒 Mã PIN thanh toán -->
    <div class="section card pin-section">
      <h3>🔒 Mã PIN thanh toán</h3>

      <div v-if="checkingPin" class="pin-box loading">⏳ Đang kiểm tra mã PIN...</div>

      <div v-else-if="hasPin" class="pin-box success">
        ✅ Bạn đã thiết lập mã PIN để bảo mật thanh toán.
        <button class="btn-change" @click="goToAddPin">🔁 Đổi mã PIN</button>
      </div>

      <div v-else class="pin-box warning">
        ⚠️ Bạn chưa có mã PIN thanh toán.
        <button class="btn-add" @click="goToAddPin">➕ Thêm mã PIN</button>
      </div>
    </div>

    <!-- 📦 Trạng thái đơn hàng -->
    <div class="section card order-section">
      <PurchaseStatus />
    </div>

    <!-- 🔐 Popup đổi mật khẩu -->
    <div v-if="showPasswordPopup" class="popup-overlay" @click.self="closePopups">
      <div class="popup">
        <h3>🔐 Đổi mật khẩu</h3>
        <div class="input-group">
          <input v-model="passwordForm.oldPassword" type="password" placeholder="Mật khẩu cũ" />
        </div>
        <div class="input-group">
          <input v-model="passwordForm.newPassword" type="password" placeholder="Mật khẩu mới" />
        </div>
        <div class="popup-actions">
          <button class="btn-cancel" @click="closePopups">Hủy</button>
          <button class="btn-save" @click="updatePassword">Cập nhật</button>
        </div>
      </div>
    </div>

    <!-- 📱 Popup cập nhật số điện thoại -->
    <div v-if="showPhonePopup" class="popup-overlay" @click.self="closePopups">
      <div class="popup">
        <h3>{{ user.phone ? "📱 Cập nhật số điện thoại" : "📱 Liên kết số điện thoại" }}</h3>
        <div class="input-group">
          <input
            v-model="phoneForm.phone"
            type="text"
            placeholder="Nhập số điện thoại (bắt đầu bằng 0)"
            @input="validatePhone"
            maxlength="11"
          />
        </div>
        <p v-if="phoneError" class="error-text">{{ phoneError }}</p>

        <div class="popup-actions">
          <button class="btn-cancel" @click="closePopups">Hủy</button>
          <button class="btn-save" @click="updatePhone">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import AddressManager from "./AddressManager.vue";
import PaymentManager from "./PaymentManager.vue";
import PurchaseStatus from "./PurchaseStatus.vue";

export default {
  name: "Profile",
  components: { AddressManager, PaymentManager, PurchaseStatus },
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || { id: null, name: "Khách", email: "guest@example.com" },
      hasPin: false,
      checkingPin: true,
      showPasswordPopup: false,
      showPhonePopup: false,
      passwordForm: { oldPassword: "", newPassword: "" },
      phoneForm: { phone: "" },
      phoneError: "",
    };
  },
  methods: {
    async checkPin() {
      try {
        this.checkingPin = true;
        const res = await axios.get(`http://localhost:5000/api/pins/${this.user.email}`);
        this.hasPin = res.data?.hasPin || false;
      } catch {
        this.hasPin = false;
      } finally {
        this.checkingPin = false;
      }
    },
    goToAddPin() {
      this.$router.push("/addpin");
    },
    openChangePassword() {
      this.showPasswordPopup = true;
    },
    openLinkPhone() {
      this.showPhonePopup = true;
      this.phoneForm.phone = this.user.phone ? this.user.phone.replace("+84", "") : "";
    },
    closePopups() {
      this.showPasswordPopup = false;
      this.showPhonePopup = false;
    },
    validatePhone() {
      this.phoneForm.phone = this.phoneForm.phone.replace(/\D/g, ""); // chỉ cho số
      if (this.phoneForm.phone && !this.phoneForm.phone.startsWith("0")) {
        this.phoneError = "❌ Số điện thoại phải bắt đầu bằng 0.";
      } else if (this.phoneForm.phone.length > 0 && (this.phoneForm.phone.length < 10 || this.phoneForm.phone.length > 11)) {
        this.phoneError = "❌ Số điện thoại phải có 10 hoặc 11 chữ số.";
      } else {
        this.phoneError = "";
      }
    },
    async updatePassword() {
      try {
        const res = await axios.put("http://localhost:5000/api/auth/update-password", {
          email: this.user.email,
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword,
        });
        alert(res.data.message);
        this.closePopups();
      } catch (err) {
        alert("❌ " + (err.response?.data?.error || "Lỗi đổi mật khẩu"));
      }
    },
    async updatePhone() {
      this.validatePhone();
      if (this.phoneError || !this.phoneForm.phone) {
        alert(this.phoneError || "❌ Vui lòng nhập số điện thoại hợp lệ");
        return;
      }
      try {
        const phone = "+84" + this.phoneForm.phone.replace(/^0/, "");
        const res = await axios.put("http://localhost:5000/api/auth/update-phone", {
          email: this.user.email,
          phone,
        });
        alert(res.data.message);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        this.user = res.data.user;
        this.closePopups();
      } catch (err) {
        alert("❌ " + (err.response?.data?.error || "Lỗi cập nhật số điện thoại"));
      }
    },
  },
  async mounted() {
    await this.checkPin();
  },
};
</script>

<style scoped>
.profile {
  padding: 20px 40px;
  max-width: 900px;
  margin: 0 auto;
  background: linear-gradient(180deg, #fff, #fff8f2);
  min-height: 100vh;
  border-radius: 14px;
}

/* ===== Tiêu đề chính ===== */
.title {
  font-size: 28px;
  margin-bottom: 25px;
  color: #ff6600;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.3px;
}

/* ===== Card chung ===== */
.card {
  background: #fff;
  border-radius: 14px;
  padding: 22px 26px;
  margin-bottom: 22px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transition: all 0.25s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(255, 102, 0, 0.15);
}

.section h3 {
  margin-bottom: 14px;
  color: #ff6600;
  font-size: 20px;
  font-weight: 700;
}

/* ===== Thông tin người dùng ===== */
.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(135deg, #fff, #fffdf9);
  border-left: 4px solid #ff944d;
}
.info p {
  margin: 0;
  font-size: 16px;
  color: #333;
}
.info b {
  color: #ff6600;
}

/* ✅ Bổ sung cho 2 nút Đổi mật khẩu / Liên kết SĐT */
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
}
.info-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
}
.btn-action {
  background: linear-gradient(135deg, #ff6600, #ff944d);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  box-shadow: 0 4px 10px rgba(255, 102, 0, 0.25);
  min-width: 150px;
  text-align: center;
}
.btn-action:hover {
  transform: translateY(-2px) scale(1.05);
  background: linear-gradient(135deg, #e65c00, #ff7a1a);
  box-shadow: 0 6px 16px rgba(255, 102, 0, 0.35);
}
.btn-action:active {
  transform: scale(0.97);
}

/* ===== Địa chỉ ===== */
.addresses {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 10px;
}

.address-card {
  background: linear-gradient(135deg, #fafafa, #fff);
  border-radius: 14px;
  border: 2px solid #eee;
  padding: 14px 16px;
  transition: all 0.25s ease;
  position: relative;
  cursor: pointer;
}
.address-card:hover {
  border-color: #ff944d;
  box-shadow: 0 4px 14px rgba(255, 102, 0, 0.12);
  background: #fffdf9;
}
.address-card.selected {
  border-color: #28a745;
  background: #f6fff8;
  box-shadow: 0 4px 14px rgba(40, 167, 69, 0.15);
}
.checkmark {
  position: absolute;
  top: 10px;
  right: 12px;
  color: #28a745;
  font-weight: bold;
  font-size: 20px;
}

.address-card.add-card {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ff6600;
  font-weight: 600;
  font-size: 16px;
  border: 2px dashed #ff944d;
  background: #fffdf6;
}
.address-card.add-card:hover {
  background: #fffcf2;
  transform: scale(1.03);
  box-shadow: 0 4px 10px rgba(255, 148, 77, 0.1);
}

.address-actions {
  margin-top: 8px;
  display: flex;
  gap: 10px;
}
.address-actions button {
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.address-actions button:first-child {
  background: #ff944d;
  color: #fff;
}
.address-actions button:last-child {
  background: #e74c3c;
  color: #fff;
}
.address-actions button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* ===== Mã PIN ===== */
.pin-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 10px;
  margin-top: 6px;
}
.pin-info.success {
  background: #e6fff0;
  border: 1px solid #baf0d0;
  color: #1e9e52;
}
.pin-info.warning {
  background: #fff4e6;
  border: 1px solid #ffd4a6;
  color: #d9822b;
}
.btn-add,
.btn-change {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.25s ease;
}
.btn-add {
  background: linear-gradient(135deg, #ff6600, #ff944d);
  color: white;
}
.btn-change {
  background: #28a745;
  color: white;
}
.btn-add:hover,
.btn-change:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ===== Popup form ===== */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.popup {
  background: #fff;
  border-radius: 14px;
  padding: 36px 32px; /* ✅ tăng khoảng cách trong popup */
  max-width: 420px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: popupFade 0.3s ease;
}
@keyframes popupFade {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.popup h3 {
  margin-bottom: 20px;
  color: #ff6600;
  font-weight: 700;
  text-align: center;
}

/* ✅ Các ô input popup không bị sát viền */
.popup input,
.popup select {
  width: 100%;
  padding: 14px 18px; /* tăng đệm bên trong */
  margin-bottom: 16px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 15px;
  outline: none;
  transition: all 0.25s ease;
  background-color: #fff;
  box-sizing: border-box;
}
.popup input:focus,
.popup select:focus {
  border-color: #ff944d;
  box-shadow: 0 0 0 3px rgba(255, 148, 77, 0.15);
}

/* Phần nhập số điện thoại có prefix */
.phone-input {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.phone-input .prefix {
  background: #ff944d;
  color: white;
  padding: 12px;
  border-radius: 8px 0 0 8px;
}
.phone-input input {
  flex: 1;
  border-radius: 0 8px 8px 0;
  border-left: none;
}

/* Nút trong popup */
.popup-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.btn-cancel,
.btn-save {
  flex: 1;
  padding: 12px 16px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.btn-cancel {
  background: #ddd;
  color: #333;
  margin-right: 10px;
}
.btn-save {
  background: linear-gradient(135deg, #ff6600, #ff944d);
  color: white;
}
.btn-save:hover {
  background: linear-gradient(135deg, #e65c00, #ff7a1a);
  transform: translateY(-1px);
}
.btn-cancel:hover {
  background: #ccc;
  transform: translateY(-1px);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .info-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .btn-action {
    width: 100%;
    text-align: center;
  }
}
</style>

