<template>
  <div class="profile">
    <h2 class="title">👤 Thông tin cá nhân</h2>
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

    <!-- 📦 Trạng thái đơn hàng -->
    <div class="section card">
      <PurchaseStatus />
    </div>

    <!-- 📍 Popup thêm/sửa địa chỉ -->
    <div v-if="showPopup" class="popup-overlay" @click.self="closePopup">
      <div class="popup">
        <h3>{{ isEditing ? "✏️ Chỉnh sửa địa chỉ" : "➕ Thêm địa chỉ mới" }}</h3>

        <input v-model="formData.fullName" type="text" placeholder="Tên người nhận" />

        <!-- ✅ input số điện thoại có +84 cố định -->
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
      user: JSON.parse(localStorage.getItem("user")) || {
        id: null,
        name: "Khách",
        email: "guest@example.com",
      },
      addresses: [],
      selectedAddress: null,

      showPopup: false,
      isEditing: false,
      formData: {
        fullName: "",
        phone: "",
        province: "",
        street: "",
        region: "",
      },
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
        this.selectedAddress = this.addresses.find((a) => a.isDefault) || null;
      } catch (err) {
        console.error("❌ Lỗi tải địa chỉ:", err);
      }
    },
    async setDefaultAddress(addr) {
      try {
        await axios.put(`http://localhost:5000/api/addresses/${addr._id}`, {
          userId: this.user.id,
          isDefault: true,
        });
        await this.fetchAddresses();
      } catch (err) {
        console.error("❌ Lỗi set mặc định:", err);
      }
    },
    async deleteAddress(addr) {
      if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
      try {
        await axios.delete(`http://localhost:5000/api/addresses/${addr._id}`);
        await this.fetchAddresses();
      } catch (err) {
        console.error("❌ Lỗi xóa địa chỉ:", err);
      }
    },
    openAddPopup() {
      this.isEditing = false;
      this.formData = {
        fullName: "",
        phone: "",
        province: "",
        street: "",
        region: "",
      };
      this.showPopup = true;
    },
    openEditPopup(addr) {
      this.isEditing = true;
      this.formData = { ...addr, phone: addr.phone.replace("+84", "") }; // bỏ +84 để nhập lại
      this.showPopup = true;
    },
    validatePhone() {
      this.formData.phone = this.formData.phone.replace(/\D/g, ""); // chỉ số
      if (this.formData.phone.startsWith("0")) {
        this.formData.phone = this.formData.phone.slice(1);
      }
    },
    async saveAddress() {
      if (!this.formData.fullName || !this.formData.phone || !this.formData.street || !this.formData.province) {
        return alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      }
      if (this.formData.phone.length < 9 || this.formData.phone.length > 10) {
        return alert("⚠️ Số điện thoại phải từ 9-10 số!");
      }

      const payload = {
        userId: this.user.id,
        email: this.user.email,
        fullName: this.formData.fullName,
        phone: "+84" + this.formData.phone, // ✅ lưu kèm +84
        province: this.formData.province,
        street: this.formData.street,
        isDefault: this.addresses.length === 0,
      };

      try {
        if (this.isEditing && this.formData._id) {
          await axios.put(`http://localhost:5000/api/addresses/${this.formData._id}`, payload);
        } else {
          await axios.post("http://localhost:5000/api/addresses", payload);
        }
        this.closePopup();
        await this.fetchAddresses();
      } catch (err) {
        console.error("❌ Lỗi lưu địa chỉ:", err);
      }
    },
    closePopup() {
      this.showPopup = false;
      this.isEditing = false;
    },
    formatPhone(phone) {
      return phone.replace("+84", "");
    }
  },
  async mounted() {
    await this.fetchAddresses();
  },
};
</script>

<style scoped>
.profile {
  padding: 20px 40px;
  max-width: 800px;
  margin: 0 auto;
}

.title { 
  font-size: 24px; 
  margin-bottom: 20px; 
  color: #2c3e50; 
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 18px 22px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.section h3 { 
  margin-bottom: 12px; 
  color: #ff6600; 
  font-size: 18px; 
}

/* 📍 Address cards */
.addresses { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
  gap: 14px; 
}
.address-card { 
  position: relative; 
  border: 1px solid #eee; 
  border-radius: 10px; 
  padding: 14px; 
  background: #fafafa; 
  cursor: pointer; 
  transition: all 0.2s ease; 
}
.address-card:hover { 
  border-color: #aaa; 
  background: #fdfdfd; 
}
.address-card.selected { 
  border: 2px solid #28a745; 
  background: #f6fff8; 
}
.checkmark { 
  position: absolute; 
  top: 6px; 
  right: 8px; 
  font-size: 14px; 
  color: #28a745; 
}
.address-actions { 
  margin-top: 8px; 
  display: flex; 
  gap: 8px; 
}
.address-actions button { 
  padding: 5px 10px; 
  border: none; 
  border-radius: 6px; 
  cursor: pointer; 
  font-size: 13px; 
}
.address-actions button:first-child { 
  background: #ffc107; 
  color: #000; 
}
.address-actions button:last-child { 
  background: #dc3545; 
  color: #fff; 
}
.phone { 
  color: #007bff; 
  font-weight: bold; 
}

/* 📍 Popup */
.popup-overlay { 
  position: fixed; 
  top: 0; left: 0; right: 0; bottom: 0; 
  background: rgba(0,0,0,0.5); 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 2000; 
}
.popup { 
  background: white; 
  padding: 20px; 
  border-radius: 12px; 
  max-width: 420px; 
  width: 100%; 
  box-shadow: 0 6px 18px rgba(0,0,0,0.2); 
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.popup h3 { 
  margin-bottom: 10px; 
  text-align: center; 
  color: #ff6600;
}
.popup input, 
.popup select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

/* 📱 phone input */
.phone-input {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.phone-input .prefix {
  background: #f0f0f0;
  padding: 12px 14px;
  font-weight: bold;
  color: #333;
  border-right: 1px solid #ccc;
  font-size: 14px;
}
.phone-input input {
  flex: 1;
  padding: 12px;
  border: none;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

/* Buttons */
.popup-actions { 
  display: flex; 
  justify-content: flex-end; 
  gap: 10px; 
  margin-top: 8px; 
}
.btn-cancel, 
.btn-save {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}
.btn-cancel { 
  background: #ccc; 
  color: #000; 
}
.btn-save { 
  background: #ff6600; 
  color: white; 
}
.btn-save:hover { 
  background: #e65500; 
}

</style>
