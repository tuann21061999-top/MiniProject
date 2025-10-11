<template>
  <div class="profile">
    <h2 class="title">👤 Thông tin cá nhân</h2>

    <!-- 🔹 Thông tin cơ bản -->
    <div class="info card">
      <p><b>Tên người dùng:</b> {{ user.name }}</p>
      <p><b>Email:</b> {{ user.email }}</p>
    </div>

    <!-- 📍 Địa chỉ nhận hàng -->
    <div class="section card">
      <h3>📍 Địa chỉ nhận hàng</h3>
      <div class="addresses">
        <div
          v-for="addr in addresses"
          :key="addr._id"
          class="address-card"
          :class="{ selected: selectedAddress?._id === addr._id }"
          @click="setDefaultAddress(addr)"
        >
          <span v-if="selectedAddress?._id === addr._id" class="checkmark">✅</span>
          <p><b>{{ addr.fullName }}</b> | <span class="phone">+84 {{ formatPhone(addr.phone) }}</span></p>
          <p>{{ addr.street }}, {{ addr.province }}</p>
          <p><i>{{ addr.region }}</i></p>

          <div class="address-actions" @click.stop>
            <button @click="openEditPopup(addr)">✏️ Sửa</button>
            <button @click="deleteAddress(addr)">🗑️ Xóa</button>
          </div>
        </div>

        <div class="address-card add-card" @click="openAddPopup">
          ➕ Thêm địa chỉ mới
        </div>
      </div>
    </div>

    <!-- 💳 Quản lý phương thức thanh toán -->
    <div class="section card">
      <PaymentManager />
    </div>

    <!-- 🔒 Mã PIN thanh toán -->
    <div class="section card">
      <h3>🔒 Mã PIN thanh toán</h3>

      <div v-if="checkingPin">
        <p>⏳ Đang kiểm tra mã PIN...</p>
      </div>

      <div v-else-if="hasPin" class="pin-info success">
        ✅ Bạn đã thiết lập mã PIN để bảo mật thanh toán.
        <button class="btn-change" @click="goToAddPin">🔁 Đổi mã PIN</button>
      </div>

      <div v-else class="pin-info warning">
        ⚠️ Bạn chưa có mã PIN thanh toán.
        <button class="btn-add" @click="goToAddPin">➕ Thêm mã PIN</button>
      </div>
    </div>

    <!-- 📦 Trạng thái đơn hàng -->
    <div class="section card">
      <PurchaseStatus />
    </div>

    <!-- 📍 Popup thêm/sửa địa chỉ -->
    <div v-if="showPopup" class="popup-overlay" @click.self="closePopup">
      <div class="popup">
        <h3>{{ isEditing ? "✏️ Chỉnh sửa địa chỉ" : "➕ Thêm địa chỉ mới" }}</h3>
        <input v-model="formData.fullName" type="text" placeholder="Tên người nhận" />
        <div class="phone-input">
          <span class="prefix">+84</span>
          <input
            v-model="formData.phone"
            type="text"
            placeholder="912345678"
            maxlength="10"
            @input="validatePhone"
          />
        </div>
        <select v-model="formData.province">
          <option disabled value="">-- Chọn tỉnh/thành --</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>
        <input v-model="formData.street" type="text" placeholder="Địa chỉ chi tiết (số nhà, đường...)" />
        <div class="popup-actions">
          <button class="btn-cancel" @click="closePopup">Hủy</button>
          <button class="btn-save" @click="saveAddress">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import PaymentManager from "./PaymentManager.vue";
import PurchaseStatus from "./PurchaseStatus.vue";

export default {
  name: "Profile",
  components: { PaymentManager, PurchaseStatus },
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || { id: null, name: "Khách", email: "guest@example.com" },
      addresses: [],
      selectedAddress: null,

      hasPin: false,
      checkingPin: true, // trạng thái đang tải PIN

      showPopup: false,
      isEditing: false,
      formData: {},
      provinces: [
        "Hà Nội","Hải Phòng","Quảng Ninh","Bắc Ninh","Bắc Giang","Nam Định","Thái Bình",
        "Hải Dương","Hưng Yên","Vĩnh Phúc","Phú Thọ","Ninh Bình","Hà Nam","Thái Nguyên",
        "Lạng Sơn","Cao Bằng","Yên Bái","Tuyên Quang","Hà Giang","Lào Cai","Bắc Kạn",
        "Điện Biên","Lai Châu","Sơn La","Hòa Bình","Thanh Hóa","Nghệ An","Hà Tĩnh",
        "Quảng Bình","Quảng Trị","Thừa Thiên Huế","Đà Nẵng","Quảng Nam","Quảng Ngãi",
        "Bình Định","Phú Yên","Khánh Hòa","Ninh Thuận","Bình Thuận","Kon Tum","Gia Lai",
        "Đắk Lắk","Đắk Nông","Lâm Đồng","TP Hồ Chí Minh","Bình Dương","Đồng Nai",
        "Bà Rịa - Vũng Tàu","Tây Ninh","Long An","Tiền Giang","Bến Tre","Vĩnh Long",
        "Trà Vinh","Đồng Tháp","An Giang","Kiên Giang","Cần Thơ","Hậu Giang","Sóc Trăng",
        "Bạc Liêu","Cà Mau","Bình Phước"
      ],
    };
  },
  methods: {
    async fetchAddresses() {
      if (!this.user?.id) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/addresses/${this.user.id}`);
        this.addresses = res.data;
        this.selectedAddress = this.addresses.find(a => a.isDefault) || null;
      } catch (err) {
        console.error("❌ Lỗi tải địa chỉ:", err);
      }
    },

    async checkPin() {
      try {
        this.checkingPin = true;
        const res = await axios.get(`http://localhost:5000/api/pins/${this.user.email}`);
        this.hasPin = res.data?.hasPin || false;
      } catch (err) {
        console.error("❌ Lỗi kiểm tra PIN:", err);
        this.hasPin = false;
      } finally {
        this.checkingPin = false;
      }
    },

    goToAddPin() {
      this.$router.push("/addpin");
    },

    async setDefaultAddress(addr) {
      await axios.put(`http://localhost:5000/api/addresses/${addr._id}`, {
        userId: this.user.id,
        isDefault: true,
      });
      await this.fetchAddresses();
    },
    async deleteAddress(addr) {
      if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
      await axios.delete(`http://localhost:5000/api/addresses/${addr._id}`);
      await this.fetchAddresses();
    },

    // Form địa chỉ
    openAddPopup() {
      this.isEditing = false;
      this.formData = {};
      this.showPopup = true;
    },
    openEditPopup(addr) {
      this.isEditing = true;
      this.formData = { ...addr, phone: addr.phone.replace("+84", "") };
      this.showPopup = true;
    },
    validatePhone() {
      this.formData.phone = this.formData.phone.replace(/\D/g, "");
      if (this.formData.phone.startsWith("0"))
        this.formData.phone = this.formData.phone.slice(1);
    },
    async saveAddress() {
      if (!this.formData.fullName || !this.formData.phone || !this.formData.street || !this.formData.province)
        return alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      const payload = {
        userId: this.user.id,
        email: this.user.email,
        fullName: this.formData.fullName,
        phone: "+84" + this.formData.phone,
        province: this.formData.province,
        street: this.formData.street,
        isDefault: this.addresses.length === 0,
      };
      if (this.isEditing && this.formData._id)
        await axios.put(`http://localhost:5000/api/addresses/${this.formData._id}`, payload);
      else
        await axios.post("http://localhost:5000/api/addresses", payload);

      this.closePopup();
      await this.fetchAddresses();
    },
    closePopup() {
      this.showPopup = false;
      this.isEditing = false;
    },
    formatPhone(phone) {
      return phone.replace("+84", "");
    },
  },
  async mounted() {
    await this.fetchAddresses();
    await this.checkPin(); // 🔥 luôn kiểm tra với backend để hiển thị đúng
  },
  watch: {
    // 🔄 Khi đổi tài khoản khác, tự động kiểm tra lại PIN mới
    "user.email"(newEmail, oldEmail) {
      if (newEmail && newEmail !== oldEmail) {
        this.checkPin();
      }
    },
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
  padding: 24px;
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
  margin-bottom: 16px;
  color: #ff6600;
  font-weight: 700;
  text-align: center;
}
.popup input,
.popup select {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 15px;
  outline: none;
  transition: all 0.25s ease;
}
.popup input:focus,
.popup select:focus {
  border-color: #ff944d;
  box-shadow: 0 0 0 3px rgba(255, 148, 77, 0.15);
}
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
.popup-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.btn-cancel,
.btn-save {
  flex: 1;
  padding: 10px 14px;
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
</style>
