<template>
  <div class="purchase-detail" v-if="purchase">
    <h2 class="page-title">📦 Chi tiết đơn mua</h2>

    <!-- Danh sách sản phẩm -->
    <div class="section card">
      <h3>🛍️ Sản phẩm</h3>
      <div v-for="(item, idx) in purchase.items" :key="idx" class="purchase-item">
        <img :src="item.image || 'https://via.placeholder.com/80'" class="item-img" />
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p>Màu: {{ item.color }} | Bộ nhớ: {{ item.storage }}</p>
          <p>Số lượng: {{ item.quantity }}</p>
          <p class="price">{{ formatPrice(item.price) }}</p>
        </div>
      </div>
    </div>

    <!-- Địa chỉ giao hàng -->
    <div class="section card">
      <h3>📍 Địa chỉ giao hàng</h3>
      <div v-if="addresses.length" class="address-list">
        <div
          v-for="(addr, idx) in addresses"
          :key="idx"
          class="address-card"
          :class="{ selected: selectedAddress === idx }"
          @click="selectAddress(idx)"
        >
          <p><b>{{ addr.name }}</b> - {{ addr.phone }}</p>
          <p>{{ addr.detail }}</p>
          <p><i>{{ addr.province }}</i></p>
          <span v-if="selectedAddress === idx" class="checkmark">✔</span>

          <!-- Nút sửa -->
          <div class="address-actions" @click.stop>
            <button @click="editAddress(idx)">✏️ Sửa</button>
          </div>
        </div>
      </div>
      <div v-else>
        <p class="empty">Chưa có địa chỉ nào.</p>
      </div>
      <button class="btn-add" @click="goProfile">➕ Quản lý địa chỉ</button>
    </div>

    <!-- Phương thức vận chuyển -->
    <div class="section card">
      <h3>🚚 Phương thức vận chuyển</h3>
      <div class="options">
        <label v-for="opt in shippingOptions" :key="opt" class="option-box">
          <input type="radio" v-model="selectedShipping" :value="opt" />
          {{ opt }}
        </label>
      </div>
    </div>

    <!-- Gói bảo hành -->
    <div class="section card">
      <h3>🛡️ Gói bảo hành</h3>
      <div class="options">
        <label v-for="opt in warrantyOptions" :key="opt" class="option-box">
          <input type="radio" v-model="selectedWarranty" :value="opt" />
          {{ opt }}
        </label>
      </div>
    </div>

    <!-- Phương thức thanh toán -->
    <div class="section card">
      <h3>💳 Phương thức thanh toán</h3>
      <PaymentManager />
    </div>

    <!-- Thông tin đơn mua -->
    <div class="section card summary">
      <h3>📑 Thông tin đơn</h3>
      <p><b>Email:</b> {{ purchase.email }}</p>
      <p><b>Ngày đặt:</b> {{ new Date(purchase.createdAt).toLocaleString() }}</p>

      <!-- Giá gốc -->
      <p><b>Giá gốc:</b> {{ formatPrice(purchase.total) }}</p>

      <!-- Phí bảo hành -->
      <p v-if="selectedWarranty !== 'Bảo hành thường'">
        <b>Phí bảo hành ({{ selectedWarranty }}):</b>
        +{{ formatPrice(selectedWarranty === 'Bảo hành vàng' ? 500000 : 1000000) }}
      </p>

      <!-- Phí vận chuyển -->
      <p v-if="shippingFee > 0">
        <b>Phí vận chuyển:</b> +{{ formatPrice(shippingFee) }}
        <br />
        <small class="shipping-detail">
          (Khu vực: {{ formatPrice(regionFee) }}, Đơn vị: {{ formatPrice(methodFee) }})
        </small>
      </p>

      <!-- Tổng sau tất cả -->
      <p class="total">
        <b>Tổng thanh toán:</b> {{ formatPrice(purchase.totalWithWarranty || purchase.total) }}
      </p>
    </div>

    <!-- Nút xác nhận -->
    <div class="action-box">
      <button class="confirm-btn" @click="confirmPurchase">✅ Xác nhận đơn hàng</button>
    </div>

    <!-- 📍 Popup chỉnh sửa địa chỉ -->
    <div v-if="showPopup" class="popup-overlay" @click.self="closePopup">
      <div class="popup">
        <h3>✏️ Chỉnh sửa địa chỉ</h3>

        <input v-model="editForm.name" type="text" placeholder="Tên người nhận" />
        <input v-model="editForm.phone" type="text" placeholder="Số điện thoại" />

        <select v-model="editForm.province" @change="updateRegion">
          <option disabled value="">-- Chọn tỉnh/thành phố --</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>

        <input v-model="editForm.detail" type="text" placeholder="Địa chỉ chi tiết" />

        <div class="popup-actions">
          <button class="btn-cancel" @click="closePopup">Hủy</button>
          <button class="btn-save" @click="saveEditedAddress">Lưu</button>
        </div>
      </div>
    </div>
  </div>

  <p v-else class="loading">⏳ Đang tải thông tin đơn mua...</p>
</template>

<script>
import axios from "axios";
import PaymentManager from "./PaymentManager.vue";

export default {
  name: "PurchaseDetail",
  props: ["purchaseId"],
  components: { PaymentManager },
  data() {
    return {
      purchase: null,
      user: JSON.parse(localStorage.getItem("user")) || null,
      addresses: [],
      selectedAddress: null,
      showPopup: false,
      editIndex: null,
      editForm: { name: "", phone: "", province: "", detail: "", region: "" },
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
      shippingOptions: ["Viettel Post", "Giao Hàng Nhanh", "Giao Hàng Tiết Kiệm"],
      selectedShipping: "Viettel Post",
      warrantyOptions: ["Bảo hành thường", "Bảo hành vàng", "Bảo hành VIP"],
      selectedWarranty: "Bảo hành thường",

      shippingFee: 0,
      regionFee: 0,
      methodFee: 0,
    };
  },
  methods: {
    async fetchPurchase() {
      try {
        const id = this.$route.params.purchaseId;
        const res = await axios.get(`http://localhost:5000/api/purchases/${id}`);
        this.purchase = res.data;

        // Lấy ảnh từ phones
        for (let item of this.purchase.items) {
          try {
            const phoneRes = await axios.get(`http://localhost:5000/api/phones/${item.phoneId}`);
            const phone = phoneRes.data;
            if (phone.colors && phone.colors.length) {
              const selectedColor = phone.colors.find(c => c.name === item.color);
              item.image = selectedColor?.image || phone.image;
            } else {
              item.image = phone.image;
            }
          } catch {
            item.image = "https://via.placeholder.com/80";
          }
        }

        // Lấy địa chỉ từ localStorage (bao gồm region)
        this.addresses = JSON.parse(localStorage.getItem("addresses") || "[]");

        // Cập nhật lại tổng tiền với bảo hành hiện tại
        this.calculateTotal();
      } catch (err) {
        console.error("❌ Lỗi lấy purchase:", err);
      }
    },

    calculateTotal() {
      if (!this.purchase) return;
      let baseTotal = this.purchase.total;

      // ✅ Phí bảo hành
      if (this.selectedWarranty === "Bảo hành vàng") {
        baseTotal += 500000;
      } else if (this.selectedWarranty === "Bảo hành VIP") {
        baseTotal += 1000000;
      }

      // ✅ Tính phí vận chuyển theo vùng
      this.regionFee = 0;
      if (this.selectedAddress !== null) {
        const address = this.addresses[this.selectedAddress];
        if (address?.region === "Miền Nam") this.regionFee = 20000;
        if (address?.region === "Miền Trung") this.regionFee = 30000;
        if (address?.region === "Miền Bắc") this.regionFee = 40000;
      }

      // ✅ Tính phí vận chuyển theo đơn vị
      this.methodFee = 0;
      if (this.selectedShipping === "Viettel Post") this.methodFee = 10000;
      if (this.selectedShipping === "Giao Hàng Nhanh") this.methodFee = 20000;
      // Giao Hàng Tiết Kiệm = 0

      this.shippingFee = this.regionFee + this.methodFee;
      this.purchase.totalWithWarranty = baseTotal + this.shippingFee;
    },

    async confirmPurchase() {
  if (!this.user) {
    alert("Bạn cần đăng nhập để xác nhận đơn hàng!");
    this.$router.push("/login");
    return;
  }
  if (this.selectedAddress === null) {
    alert("Vui lòng chọn địa chỉ giao hàng!");
    return;
  }

  try {
    const address = this.addresses[this.selectedAddress];

    // 🔑 Lấy phương thức thanh toán đã chọn từ localStorage
    const linkedAccounts = JSON.parse(localStorage.getItem("linkedAccounts") || "[]");
    const defaultAcc = linkedAccounts.find((a) => a.isDefault);
    const paymentMethod = defaultAcc ? defaultAcc.type.toUpperCase() : "COD";

// 🔑 Nếu là COD → pending, còn lại → paid
const status = paymentMethod === "COD" ? "pending" : "paid";


    const res = await axios.put(`http://localhost:5000/api/purchases/${this.purchase._id}`, {
      status,
      shippingAddress: address.detail,
      province: address.province,
      region: address.region,
      phone: address.phone,
      warranty: this.selectedWarranty,
      shippingMethod: this.selectedShipping,
      paymentMethod,  // ✅ gửi thẳng lên Mongo
      total: this.purchase.totalWithWarranty || this.purchase.total,
    });

    if (res.status === 200) {
      // Lưu lại trạng thái local để đồng bộ UI
      const purchaseStates = JSON.parse(localStorage.getItem("purchaseStates") || "{}");
      purchaseStates[this.purchase._id] = {
        status,
        paymentMethod,
        updatedAt: new Date().toISOString(),
        total: this.purchase.totalWithWarranty || this.purchase.total,
      };
      localStorage.setItem("purchaseStates", JSON.stringify(purchaseStates));

      alert(`✅ Đơn hàng đã được xác nhận (${status === "paid" ? "Đã thanh toán" : "Chờ thanh toán"})!`);
      this.$router.push("/profile");
    }
  } catch (err) {
    console.error("❌ Lỗi xác nhận đơn hàng:", err);
    alert("Xác nhận thất bại, vui lòng thử lại!");
  }

  // ✅ Sau khi xác nhận đơn, xóa giỏ hàng
  try {
    await axios.delete("http://localhost:5000/api/orders/clear", {
      data: { email: this.user.email }
    });
  } catch (err) {
    console.warn("⚠️ Không thể xoá giỏ hàng sau khi xác nhận:", err);
  }
},

    selectAddress(idx) { this.selectedAddress = idx; },
    goProfile() { this.$router.push("/profile"); },
    editAddress(index) {
      this.editForm = { ...this.addresses[index] };
      this.editIndex = index;
      this.showPopup = true;
    },
    updateRegion() { this.editForm.region = this.getRegion(this.editForm.province); },
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
    saveEditedAddress() {
      if (!this.editForm.name || !this.editForm.phone || !this.editForm.province || !this.editForm.detail) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
      this.editForm.region = this.getRegion(this.editForm.province);
      this.addresses.splice(this.editIndex, 1, { ...this.editForm });
      localStorage.setItem("addresses", JSON.stringify(this.addresses));
      this.closePopup();
    },
    closePopup() {
      this.showPopup = false;
      this.editForm = { name: "", phone: "", province: "", detail: "", region: "" };
    },
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value || 0);
    },
  },
  watch: {
    selectedWarranty() {
      this.calculateTotal();
    },
    selectedShipping() {
      this.calculateTotal();
    },
    selectedAddress() {
      this.calculateTotal();
    }
  },
  mounted() {
    this.fetchPurchase();
  },
};
</script>

<style scoped>
.page-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 26px;
  color: #ff6600;
}
.section.card {
  background: #fff;
  border-radius: 12px;
  padding: 18px 22px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.purchase-item {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
}
.item-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
}
.address-list {
  display: flex;
  flex-direction: column;
  gap: 16px; /* tăng khoảng cách giữa các ô */
}

.address-card {
  padding: 16px;
  border: 2px solid #e0e0e0; /* viền rõ hơn */
  border-radius: 12px;        /* bo góc mềm */
  background: #fafafa;
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06); /* bóng nhẹ */
}

.address-card:hover {
  background: #fff;
  border-color: #999; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px); /* nổi lên chút */
}

.address-card.selected {
  border-color: #28a745; 
  background: #f0fff4; /* xanh nhạt khi được chọn */
  box-shadow: 0 4px 14px rgba(40, 167, 69, 0.2);
}

.checkmark {
  position: absolute;
  top: 10px;
  right: 12px;
  color: #28a745;
  font-weight: bold;
  font-size: 18px;
}
.address-actions {
  position: absolute;
  top: 10px;
  right: 40px;
}
.price { color: #ff6600; font-weight: bold; }
.total { font-size: 18px; color: #e65500; margin-top: 10px; font-weight: bold; }
.action-box { text-align: center; margin-top: 20px; }
.confirm-btn {
  padding: 12px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
}
.confirm-btn:hover { background: #218838; transform: scale(1.05); }
.shipping-detail { color: #666; font-size: 13px; }
</style>
