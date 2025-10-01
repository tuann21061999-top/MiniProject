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
          v-for="(addr, index) in addresses"
          :key="index"
          class="address-card"
          :class="{ selected: selectedAddressIndex === index }"
          @click="selectAddress(index)"
        >
          <!-- Dấu tích ✅ -->
          <span v-if="selectedAddressIndex === index" class="checkmark">✅</span>
          <p><b>{{ addr.name }}</b> | {{ addr.phone }}</p>
          <p>{{ addr.detail }}</p>
          <p><i>{{ addr.province }} ({{ addr.region }})</i></p>

          <!-- Nút thao tác -->
          <div class="address-actions" @click.stop>
            <button @click="editAddress(index)">✏️ Sửa</button>
            <button @click="deleteAddress(index)">🗑️ Xóa</button>
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

        <input v-model="newAddress.name" type="text" placeholder="Tên người nhận" />
        <input v-model="newAddress.phone" type="text" placeholder="Số điện thoại" />

        <select v-model="newAddress.province" @change="updateRegion">
          <option disabled value="">-- Chọn tỉnh/thành phố --</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>

        <input v-model="newAddress.detail" type="text" placeholder="Địa chỉ chi tiết" />

        <p v-if="newAddress.region"><b>Miền:</b> {{ newAddress.region }}</p>

        <div class="popup-actions">
          <button class="btn-cancel" @click="closePopup">Hủy</button>
          <button class="btn-save" @click="saveAddress">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PaymentManager from "./PaymentManager.vue";
import PurchaseStatus from "./PurchaseStatus.vue";

export default {
  name: "Profile",
  components: { PaymentManager, PurchaseStatus },
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || {
        name: "Khách",
        email: "guest@example.com",
      },
      addresses: JSON.parse(localStorage.getItem("addresses") || "[]"),
      newAddress: { name: "", phone: "", province: "", detail: "", region: "" },
      provinces: [
        "An Giang","Bà Rịa - Vũng Tàu","Bạc Liêu","Bắc Giang","Bắc Kạn","Bắc Ninh","Bến Tre",
        "Bình Dương","Bình Định","Bình Phước","Bình Thuận","Cà Mau","Cần Thơ","Cao Bằng",
        "Đà Nẵng","Đắk Lắk","Đắk Nông","Điện Biên","Đồng Nai","Đồng Tháp","Gia Lai",
        "Hà Giang","Hà Nam","Hà Nội","Hà Tĩnh","Hải Dương","Hải Phòng","Hậu Giang",
        "Hòa Bình","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu","Lâm Đồng",
        "Lạng Sơn","Lào Cai","Long An","Nam Định","Nghệ An","Ninh Bình","Ninh Thuận",
        "Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị",
        "Sóc Trăng","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên","Thanh Hóa","Thừa Thiên Huế",
        "Tiền Giang","TP Hồ Chí Minh","Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái"
      ],
      showPopup: false,
      isEditing: false,
      editIndex: null,
      selectedAddressIndex: null,
    };
  },
  methods: {
    openAddPopup() {
      this.newAddress = { name: "", phone: "", province: "", detail: "", region: "" };
      this.isEditing = false;
      this.showPopup = true;
    },
    editAddress(index) {
      this.newAddress = { ...this.addresses[index] };
      this.editIndex = index;
      this.isEditing = true;
      this.showPopup = true;
    },
    deleteAddress(index) {
      if (confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
        this.addresses.splice(index, 1);
        localStorage.setItem("addresses", JSON.stringify(this.addresses));
        if (this.selectedAddressIndex === index) {
          this.selectedAddressIndex = null;
          localStorage.removeItem("selectedAddressIndex");
        }
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
    updateRegion() {
      this.newAddress.region = this.getRegion(this.newAddress.province);
    },
    saveAddress() {
      if (!this.newAddress.name || !this.newAddress.phone || !this.newAddress.province || !this.newAddress.detail) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
      this.newAddress.region = this.getRegion(this.newAddress.province);

      if (this.isEditing) {
        this.addresses.splice(this.editIndex, 1, { ...this.newAddress });
      } else {
        this.addresses.push({ ...this.newAddress });
      }

      localStorage.setItem("addresses", JSON.stringify(this.addresses));
      this.closePopup();
    },
    closePopup() {
      this.showPopup = false;
      this.isEditing = false;
      this.newAddress = { name: "", phone: "", province: "", detail: "", region: "" };
    },
    selectAddress(index) {
      this.selectedAddressIndex = index;
      localStorage.setItem("selectedAddressIndex", index);
    },
  },
  mounted() {
    const savedIndex = localStorage.getItem("selectedAddressIndex");
    if (savedIndex !== null) {
      this.selectedAddressIndex = parseInt(savedIndex);
    }
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.address-card {
  position: relative;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 12px;
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
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}
.address-actions button:first-child {
  background: #ffc107;
  color: #000;
}
.address-actions button:last-child {
  background: #dc3545;
  color: #fff;
}

/* 📍 Popup */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  max-width: 400px;
  width: 100%;
  box-shadow: 0 6px 18px rgba(0,0,0,0.2);
}
.popup h3 {
  margin-bottom: 15px;
  text-align: center;
}
.popup input{
  width: 94.7%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.popup select {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
.btn-cancel {
  padding: 8px 14px;
  background: #ccc;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-save {
  padding: 8px 14px;
  background: #ff6600;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}
.btn-save:hover { background: #e65500; }
</style>
