<template>
  <div class="section card address-manager">
    <h3>🏠 Địa chỉ giao hàng</h3>

    <!-- Danh sách địa chỉ -->
    <ul class="address-list">
      <li
        v-for="addr in addresses"
        :key="addr._id"
        :class="{ active: addr.isDefault }"
        @click="setDefault(addr)"
      >
        <div class="address-info">
          <p><b>{{ addr.fullName || 'Người nhận' }}</b> -{{ addr.phone }}</p>
          <p>{{ addr.street }}, {{ addr.province }}</p>
          <p><i>{{ addr.region }}</i></p>
          <small class="creator">📧 {{ addr.email }}</small>
        </div>
        <div class="address-actions">
          <span v-if="addr.isDefault" class="check-mark">✅</span>
          <button class="edit-btn" @click.stop="editAddress(addr)">✏️</button>
          <button class="remove-btn" @click.stop="removeAddress(addr)">🗑</button>
        </div>
      </li>
    </ul>

    <!-- Nút thêm địa chỉ -->
    <button class="add-btn" @click="openForm()">➕ Thêm địa chỉ</button>

    <!-- Popup Form -->
    <div v-if="showForm" class="overlay">
      <div class="form-popup">
        <h3>{{ isEditing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới" }}</h3>

        <label>Họ tên người nhận:</label>
        <input v-model="formData.fullName" placeholder="Nguyễn Văn A" />

        <label>Số điện thoại (+84):</label>
        <input
          v-model="formData.phone"
          placeholder="912345678"
          maxlength="10"
          @input="validatePhone"
        />

        <label>Tỉnh / Thành phố:</label>
        <select v-model="formData.province">
          <option disabled value="">-- Chọn tỉnh/thành --</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>

        <label>Địa chỉ cụ thể:</label>
        <input v-model="formData.street" placeholder="Số nhà, đường..." />

        <div class="actions">
          <button @click="confirmSave">{{ isEditing ? "Cập nhật" : "Lưu" }}</button>
          <button class="cancel" @click="closeForm">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AddressManager",
  data() {
    return {
      addresses: [],
      showForm: false,
      isEditing: false,
      editId: null,
      formData: {
        fullName: "",
        phone: "",
        province: "",
        street: "",
      },
      user: JSON.parse(localStorage.getItem("user")) || null,
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
      } catch (err) {
        console.error("❌ Lỗi tải địa chỉ:", err);
      }
    },

    validatePhone() {
      this.formData.phone = this.formData.phone.replace(/\D/g, "");
      if (this.formData.phone.startsWith("0")) {
        this.formData.phone = this.formData.phone.slice(1);
      }
    },

    getRegion(province) {
      const north = ["Hà Nội","Hải Phòng","Quảng Ninh","Bắc Ninh","Bắc Giang","Nam Định","Thái Bình",
        "Hải Dương","Hưng Yên","Vĩnh Phúc","Phú Thọ","Ninh Bình","Hà Nam","Thái Nguyên",
        "Lạng Sơn","Cao Bằng","Yên Bái","Tuyên Quang","Hà Giang","Lào Cai","Bắc Kạn",
        "Điện Biên","Lai Châu","Sơn La","Hòa Bình"];
      const central = ["Thanh Hóa","Nghệ An","Hà Tĩnh","Quảng Bình","Quảng Trị","Thừa Thiên Huế",
        "Đà Nẵng","Quảng Nam","Quảng Ngãi","Bình Định","Phú Yên","Khánh Hòa",
        "Ninh Thuận","Bình Thuận","Kon Tum","Gia Lai","Đắk Lắk","Đắk Nông","Lâm Đồng"];
      const south = ["TP Hồ Chí Minh","Bình Dương","Đồng Nai","Bà Rịa - Vũng Tàu","Tây Ninh",
        "Long An","Tiền Giang","Bến Tre","Vĩnh Long","Trà Vinh","Đồng Tháp","An Giang",
        "Kiên Giang","Cần Thơ","Hậu Giang","Sóc Trăng","Bạc Liêu","Cà Mau","Bình Phước"];

      if (north.includes(province)) return "Miền Bắc";
      if (central.includes(province)) return "Miền Trung";
      if (south.includes(province)) return "Miền Nam";
      return "Khác";
    },

    openForm(addr = null) {
      this.showForm = true;
      if (addr) {
        this.isEditing = true;
        this.editId = addr._id;
        this.formData = { 
          fullName: addr.fullName,
          phone: addr.phone.replace("+84",""),
          province: addr.province,
          street: addr.street 
        };
      } else {
        this.isEditing = false;
        this.editId = null;
        this.resetForm();
      }
    },

    async confirmSave() {
      if (!this.formData.fullName || !this.formData.phone || !this.formData.province || !this.formData.street) {
        return alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      }
      if (this.formData.phone.length < 9 || this.formData.phone.length > 10) {
        return alert("⚠️ Số điện thoại phải từ 9-10 số!");
      }

      const payload = {
        userId: this.user.id,
        email: this.user.email,
        fullName: this.formData.fullName,
        phone: this.formData.phone,
        province: this.formData.province,
        street: this.formData.street,
        region: this.getRegion(this.formData.province),
        isDefault: this.addresses.length === 0,
      };

      try {
        if (this.isEditing && this.editId) {
          await axios.put(`http://localhost:5000/api/addresses/${this.editId}`, payload);
        } else {
          await axios.post("http://localhost:5000/api/addresses", payload);
        }
        this.showForm = false;
        this.resetForm();
        await this.fetchAddresses();
      } catch (err) {
        console.error("❌ Lỗi lưu địa chỉ:", err);
      }
    },

    async setDefault(addr) {
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

    async removeAddress(addr) {
      try {
        await axios.delete(`http://localhost:5000/api/addresses/${addr._id}`);
        await this.fetchAddresses();
      } catch (err) {
        console.error("❌ Lỗi xóa địa chỉ:", err);
      }
    },

    editAddress(addr) {
      this.openForm(addr);
    },

    closeForm() {
      this.showForm = false;
      this.resetForm();
    },

    resetForm() {
      this.formData = { fullName: "", phone: "", province: "", street: "" };
    },
  },
  async mounted() {
    await this.fetchAddresses();
  },
};
</script>

<style scoped>
.address-manager h3 { color: #ff6600; margin-bottom: 10px; }
.address-list { list-style: none; padding: 0; margin: 0; }
.address-list li {
  background: #fff3e0; border: 1px solid #ffcc80; padding: 10px;
  border-radius: 8px; margin-bottom: 6px;
  display: flex; justify-content: space-between; align-items: center;
  cursor: pointer;
}
.address-list li.active { border-color: #ff9800; background: #ffe0b2; }
.address-info p { margin: 2px 0; font-size: 14px; }
.creator { font-size: 12px; color: #666; }
.check-mark { color: #27ae60; margin-left: 8px; }
.edit-btn, .remove-btn { background: none; border: none; cursor: pointer; font-size: 14px; margin-left: 6px; }
.add-btn { margin-top: 10px; padding: 8px 14px; border: none; background: #ff6600; color: white; border-radius: 6px; cursor: pointer; }
.add-btn:hover { background: #e65c00; }
.overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.form-popup { background: #fff; padding: 20px; border-radius: 12px; width: 400px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; gap: 10px; }
.form-popup h3 { text-align: center; color: #ff6600; }
.form-popup label { font-size: 14px; font-weight: 600; }
.form-popup input, .form-popup select { padding: 10px; border: 1px solid #ddd; border-radius: 8px; outline: none; }
.actions { margin-top: 12px; display: flex; justify-content: flex-end; gap: 8px; }
.actions button { padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.actions button:first-child { background: #ff6600; color: #fff; }
.actions button:first-child:hover { background: #e65c00; }
.actions .cancel { background: #ccc; }
</style>
