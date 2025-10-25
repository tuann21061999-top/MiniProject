<template>
  <div class="purchase-detail" v-if="ready">
    <h2 class="page-title">📦 Chi tiết đơn mua</h2>

    <!-- Danh sách sản phẩm -->
    <div class="section card">
      <h3>🛍️ Sản phẩm</h3>
      <div
        v-if="items.length"
        v-for="(item, idx) in items"
        :key="idx"
        class="purchase-item"
      >
        <img
          :src="item.image || 'https://via.placeholder.com/80'"
          class="item-img"
        />
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p>Màu: {{ item.color }} | Bộ nhớ: {{ item.storage }}</p>
          <p>Số lượng: {{ item.quantity }}</p>
          <p class="price">{{ formatPrice(item.price) }}</p>
        </div>
      </div>
      <p v-else class="empty">❌ Giỏ hàng trống.</p>
    </div>

    <!-- Địa chỉ -->
    <div class="section card" v-if="!purchaseId">
      <h3>📍 Địa chỉ giao hàng</h3>
      <div v-if="addresses.length" class="address-list">
        <div
          v-for="(addr, idx) in addresses"
          :key="addr._id"
          class="address-card"
          :class="{ selected: selectedAddressIndex === idx }"
          @click="selectAddress(idx)"
        >
          <p><b>{{ addr.fullName }}</b> - {{ addr.phone }}</p>
          <p>{{ addr.street }}, {{ addr.province }}</p>
          <p><i>{{ addr.region }}</i></p>
          <span v-if="selectedAddressIndex === idx" class="checkmark">✔</span>
        </div>
      </div>
      <div v-else>
        <p class="empty">Chưa có địa chỉ nào. Vào trang Hồ sơ để thêm nhé.</p>
      </div>
      <button class="btn-add" @click="$router.push('/profile')">
        ➕ Quản lý địa chỉ
      </button>
    </div>

    <!-- Thanh toán -->
    <div class="section card" v-if="!purchaseId">
      <h3>💳 Phương thức thanh toán</h3>
      <div v-if="payMethods.length" class="pay-list">
        <div
          v-for="pm in payMethods"
          :key="pm._id"
          class="pay-item"
          :class="{ selected: selectedPayId === pm._id }"
          @click="selectedPayId = pm._id"
        >
          <span class="pm-badge">{{ normalizeType(pm.type) }}</span>
          <span>{{ formatMasked(pm) }}</span>
          <span v-if="pm.isDefault" class="default-flag">Mặc định</span>
        </div>
      </div>
      <div v-else class="empty">
        Chưa có phương thức thanh toán. Vào trang Hồ sơ để thêm.
      </div>
      <button class="btn-add" @click="$router.push('/profile')">
        ➕ Quản lý thanh toán
      </button>
    </div>

    <!-- Vận chuyển -->
    <div class="section card" v-if="!purchaseId">
      <h3>🚚 Chọn dịch vụ vận chuyển</h3>
      <div class="radio-group">
        <label
          v-for="opt in shippingOptions"
          :key="opt.name"
          class="radio-item"
        >
          <input
            type="radio"
            :value="opt.name"
            v-model="selectedShipping"
            @change="recalculate"
          />
          <span>
            {{ opt.name }}
            <i v-if="opt.fee > 0">( +{{ formatPrice(opt.fee) }})</i>
          </span>
        </label>
      </div>
    </div>

    <!-- Bảo hành -->
    <div class="section card" v-if="!purchaseId">
      <h3>🛡️ Chọn gói bảo hành</h3>
      <div class="radio-group">
        <label
          v-for="opt in warrantyOptions"
          :key="opt.name"
          class="radio-item"
        >
          <input
            type="radio"
            :value="opt.name"
            v-model="selectedWarranty"
            @change="recalculate"
          />
          <span>
            {{ opt.name }}
            <i v-if="opt.fee > 0">( +{{ formatPrice(opt.fee) }})</i>
          </span>
        </label>
      </div>
    </div>

    <!-- Tóm tắt -->
    <div class="section card summary">
      <h3>📑 Thông tin đơn</h3>
      <table class="price-table">
        <tbody>
          <tr>
            <td>💰 Giá sản phẩm</td>
            <td>{{ formatPrice(itemsTotal) }}</td>
          </tr>
          <tr v-if="regionFee">
            <td>🌍 Phí khu vực ({{ regionText || '—' }})</td>
            <td>+ {{ formatPrice(regionFee) }}</td>
          </tr>
          <tr v-if="methodFee">
            <td>🚚 Phí vận chuyển ({{ selectedShipping }})</td>
            <td>+ {{ formatPrice(methodFee) }}</td>
          </tr>
          <tr v-if="warrantyFee">
            <td>🛡️ Gói bảo hành ({{ selectedWarranty }})</td>
            <td>+ {{ formatPrice(warrantyFee) }}</td>
          </tr>
          <tr>
            <td>💳 Hình thức thanh toán</td>
            <td>{{ selectedPayType || '—' }}</td>
          </tr>
          <tr>
            <td>🧾 Trạng thái (sẽ lưu vào hệ thống)</td>
            <td>
              <span :class="['status-badge', previewStatus]">
                {{ previewStatus.toUpperCase() }}
              </span>
            </td>
          </tr>
          <tr class="total-row">
            <td><b>📑 Tổng thanh toán</b></td>
            <td><b>{{ formatPrice(grandTotal) }}</b></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Xác nhận -->
    <div class="action-box" v-if="!purchaseId">
      <button
        class="confirm-btn"
        :disabled="!canConfirm"
        @click="confirmPurchase"
      >
        ✅ Xác nhận đơn hàng
      </button>
      <p v-if="!canConfirm" class="hint">
        (Chọn địa chỉ & phương thức thanh toán trước khi xác nhận)
      </p>
    </div>
  </div>

  <p v-else class="loading">⏳ Đang tải...</p>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  name: "PurchaseDetail",
  props: ["purchaseId"],
  data() {
    return {
      ready: false,
      user: JSON.parse(localStorage.getItem("user")) || null,
      items: [],
      addresses: [],
      selectedAddressIndex: null,
      payMethods: [],
      selectedPayId: null,

      shippingOptions: [
        { name: "Giao Hàng Tiết Kiệm", fee: 10000 },
        { name: "Viettel Post", fee: 20000 },
        { name: "Giao Hàng Nhanh", fee: 30000 },
      ],
      selectedShipping: "Giao Hàng Tiết Kiệm",

      warrantyOptions: [
        { name: "Bảo hành thường", fee: 0 },
        { name: "Bảo hành vàng", fee: 500000 },
        { name: "Bảo hành VIP", fee: 1000000 },
      ],
      selectedWarranty: "Bảo hành thường",

      itemsTotal: 0,
      regionFee: 0,
      methodFee: 0,
      warrantyFee: 0,
      grandTotal: 0,

      pinAttempts: 0,
      pinLockedUntil: null,
    };
  },

  computed: {
    canConfirm() {
      return this.items.length > 0 && this.selectedAddressIndex !== null && !!this.selectedPayId;
    },
    selectedAddress() {
      if (this.selectedAddressIndex === null) return null;
      return this.addresses[this.selectedAddressIndex] || null;
    },
    regionText() {
      return this.selectedAddress?.region || null;
    },
    selectedPay() {
      return this.payMethods.find((p) => p._id === this.selectedPayId) || null;
    },
    selectedPayType() {
      return this.selectedPay ? this.normalizeType(this.selectedPay.type) : null;
    },
    isCODSelected() {
      const t = this.selectedPayType || "";
      return /(cod|cash|tiền mặt)/i.test(t);
    },
    previewStatus() {
      return this.isCODSelected ? "pending" : "paid";
    },
  },

  methods: {
    normalizeType(t) {
      return String(t || "").trim().toUpperCase();
    },

    async init() {
      if (!this.user?.email) {
        this.ready = true;
        return;
      }

      const cartData = JSON.parse(localStorage.getItem("cart")) || {};
      this.items = cartData.items || [];
      this.itemsTotal = cartData.total || 0;

      await Promise.all([this.fetchAddresses(), this.fetchPayMethods()]);

      const defAddrIndex = this.addresses.findIndex((a) => a.isDefault);
      if (defAddrIndex >= 0) this.selectedAddressIndex = defAddrIndex;

      const defPm = this.payMethods.find((p) => p.isDefault) || this.payMethods[0];
      if (defPm) this.selectedPayId = defPm._id;

      this.recalculate();
      this.ready = true;
    },

    async fetchAddresses() {
      try {
        const res = await axios.get(`http://localhost:5000/api/addresses/${this.user.id}`);
        this.addresses = res.data || [];
      } catch {
        this.addresses = [];
      }
    },

    async fetchPayMethods() {
      try {
        const res = await axios.get(`http://localhost:5000/api/paymethods/${this.user.id}`);
        const list = res.data || [];
        const hasCOD = list.some((m) => this.normalizeType(m.type) === "COD");
        if (!hasCOD) list.unshift({ _id: "cod", type: "COD" });
        this.payMethods = list;
      } catch {
        this.payMethods = [{ _id: "cod", type: "COD", isDefault: true }];
      }
    },

    selectAddress(idx) {
      this.selectedAddressIndex = idx;
      this.recalculate();
    },

    recalculate() {
      const region = this.selectedAddress?.region || null;
      this.regionFee =
        region === "Miền Nam"
          ? 10000
          : region === "Miền Trung"
          ? 20000
          : region === "Miền Bắc"
          ? 30000
          : 0;

      const shipping = this.shippingOptions.find((opt) => opt.name === this.selectedShipping);
      this.methodFee = shipping ? shipping.fee : 0;

      const warranty = this.warrantyOptions.find((opt) => opt.name === this.selectedWarranty);
      this.warrantyFee = warranty ? warranty.fee : 0;

      this.grandTotal = this.itemsTotal + this.regionFee + this.methodFee + this.warrantyFee;
    },

    formatPrice(v) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(v || 0);
    },

    formatMasked(pm) {
      if (pm.accountNumber)
        return this.normalizeType(pm.type) + " ••••" + pm.accountNumber.slice(-4);
      return this.normalizeType(pm.type);
    },

    async confirmPurchase() {
      if (!this.canConfirm) {
        return Swal.fire(
          "⚠️ Thiếu thông tin",
          "Vui lòng chọn địa chỉ và phương thức thanh toán trước!",
          "warning"
        );
      }

      const paymentMethod = this.selectedPayType || "COD";
      const status = this.isCODSelected ? "pending" : "paid";

      try {
        if (this.isCODSelected) return this.processPurchase(paymentMethod, status);

        if (this.pinLockedUntil && Date.now() < this.pinLockedUntil) {
          const remain = Math.ceil((this.pinLockedUntil - Date.now()) / 60000);
          return Swal.fire(
            "🚫 Tạm khóa",
            `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${remain} phút.`,
            "error"
          );
        }

        const check = await axios.get(`http://localhost:5000/api/pins/${this.user.email}`);
        if (!check.data?.hasPin) {
          const res = await Swal.fire({
            title: "⚠️ Chưa có mã PIN",
            text: "Bạn cần tạo mã PIN để thanh toán online. Chuyển đến trang Hồ sơ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Đến Hồ sơ",
            cancelButtonText: "Hủy",
          });
          if (res.isConfirmed) this.$router.push("/profile");
          return;
        }

        const { value: pinValue } = await Swal.fire({
          title: "🔒 Nhập mã PIN thanh toán",
          input: "password",
          inputPlaceholder: "Nhập 4–6 chữ số",
          inputAttributes: { maxlength: 6, minlength: 4 },
          showCancelButton: true,
          confirmButtonText: "Xác nhận",
          cancelButtonText: "Hủy",
        });

        if (!pinValue)
          return Swal.fire("❌ Hủy", "Bạn đã hủy xác nhận thanh toán.", "info");

        const verify = await axios.post("http://localhost:5000/api/pins/verify", {
          email: this.user.email,
          pin: pinValue,
        });

        if (!verify.data?.valid) {
          this.pinAttempts++;
          if (this.pinAttempts >= 5) {
            this.pinLockedUntil = Date.now() + 5 * 60 * 1000;
            this.pinAttempts = 0;
            return Swal.fire("🚫 Khóa tạm thời", "Bạn nhập sai 5 lần. Khóa 5 phút!", "error");
          }
          return Swal.fire("❌ Sai PIN", `Mã PIN không chính xác (${this.pinAttempts}/5)`, "error");
        }

        this.pinAttempts = 0;
        this.pinLockedUntil = null;
        await this.processPurchase(paymentMethod, status);
      } catch (err) {
        console.error("❌ Lỗi xác thực PIN:", err);
        Swal.fire("Lỗi", "Không thể xác thực mã PIN. Vui lòng thử lại sau.", "error");
      }
    },

    async processPurchase(paymentMethod, status) {
      const payload = {
        email: this.user.email,
        items: this.items,
        total: this.grandTotal,
        fullName: this.selectedAddress?.fullName,
        phone: this.selectedAddress?.phone,
        shippingAddress: this.selectedAddress?.street,
        province: this.selectedAddress?.province,
        region: this.selectedAddress?.region,
        shippingMethod: this.selectedShipping,
        paymentMethod,
        warranty: this.selectedWarranty,
        status: "waiting_approval", // 🟡 tất cả đơn mới đều chờ duyệt
      };


      try {
        const res = await axios.post("http://localhost:5000/api/purchases/checkout", payload);
        if (res.data?.success) {
          localStorage.removeItem("cart");
          await Swal.fire("✅ Thành công!", "Đơn hàng của bạn đã được tạo!", "success");
          this.$router.push("/profile");
        } else {
          Swal.fire("❌ Thất bại", "Không thể tạo đơn, vui lòng thử lại.", "error");
        }
      } catch (err) {
        console.error("❌ Lỗi xử lý đơn hàng:", err);
        Swal.fire("Lỗi", "Không thể tạo đơn hàng. Thử lại sau.", "error");
      }
    },
  },

  async mounted() {
    await this.init();
  },
};
</script>

<style scoped>
.page-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 28px;
  font-weight: 700;
  color: #ff6600;
  letter-spacing: 0.5px;
}

.section.card {
  background: #fff;
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 22px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.section.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0,0,0,0.12);
}

/* ==== Sản phẩm ==== */
.purchase-item {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  background: #fafafa;
  transition: background 0.2s, border-color 0.2s;
}
.purchase-item:hover {
  background: #fff;
  border-color: #ff944d;
  box-shadow: 0 4px 12px rgba(255,102,0,0.1);
}
.item-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  margin-right: 16px;
  transition: transform 0.25s ease;
}
.purchase-item:hover .item-img {
  transform: scale(1.05);
}

/* ==== Địa chỉ ==== */
.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(280px,1fr));
  gap: 14px;
}
.address-card {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  background: linear-gradient(135deg, #fafafa, #fff);
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;
}
.address-card:hover { 
  border-color: #ff944d;
  background: #fffdf9;
  box-shadow: 0 6px 14px rgba(255,148,77,0.15);
}
.address-card.selected {
  border-color: #28a745;
  background: #f0fff4;
  box-shadow: 0 6px 16px rgba(40,167,69,0.2);
}
.checkmark {
  position: absolute; top: 10px; right: 14px;
  color: #28a745; font-weight: bold; font-size: 20px;
}

/* Nút thêm */
.btn-add {
  margin-top: 12px;
  padding: 10px 16px;
  border: none; border-radius: 8px;
  background: linear-gradient(135deg,#ff6600,#ff944d);
  color: #fff; cursor: pointer;
  font-weight: 600;
  transition: all 0.25s ease;
}
.btn-add:hover { 
  background: linear-gradient(135deg,#e65c00,#ff7a1a);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255,102,0,0.3);
}

/* ==== Thanh toán ==== */
.pay-list { display: grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 12px; }
.pay-item {
  border: 1px solid #eee; 
  border-radius: 12px; 
  background:#fafafa;
  padding: 12px; 
  display:flex; 
  gap:10px; 
  align-items:center; 
  cursor:pointer;
  transition: all 0.25s ease;
}
.pay-item:hover {
  background:#fff;
  border-color:#ff944d;
  box-shadow: 0 4px 12px rgba(255,102,0,0.12);
}
.pay-item.selected { 
  border-color:#28a745; 
  background:#f6fff8; 
  box-shadow: 0 4px 14px rgba(40,167,69,0.15);
}
.pm-badge { 
  font-size:12px; 
  padding:4px 8px; 
  border-radius:6px; 
  background:#f0f0f0; 
  font-weight:600; 
}
.default-flag { margin-left:auto; font-size:12px; color:#28a745; font-weight:700; }

/* ==== Radio Options ==== */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.radio-item:hover { 
  background: #fff9f4; 
  border-color: #ff944d; 
}
.radio-item input[type="radio"] {
  accent-color: #ff6600;
}

/* ==== Tổng kết ==== */
.summary .price-table { width:100%; border-collapse:collapse; font-size: 15px; }
.summary td { padding:8px 6px; }
.summary td:last-child { text-align:right; }
.summary .total-row td { 
  border-top:1px dashed #ddd; 
  padding-top:12px; 
  font-size: 16px; 
  font-weight: 700;
  color: #e65c00;
}

/* Status badge */
.status-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}
.status-badge.paid {
  background: #e6fff0;
  color: #1e9e52;
  border: 1px solid #baf0d0;
}
.status-badge.pending {
  background: #fff4e6;
  color: #d9822b;
  border: 1px solid #ffd4a6;
}

/* ==== Hành động ==== */
.action-box { text-align:center; margin-top: 14px; }
.confirm-btn {
  padding: 14px 22px; 
  background: linear-gradient(135deg,#28a745,#5cd65c); 
  color:#fff; 
  border:none; 
  border-radius:10px;
  font-weight: 700; 
  cursor:pointer; 
  font-size:17px;
  transition: all 0.25s ease;
}
.confirm-btn:hover {
  background: linear-gradient(135deg,#23913d,#48c048);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(40,167,69,0.3);
}
.confirm-btn:disabled { opacity:.6; cursor:not-allowed; }
.hint { color:#888; font-size:13px; margin-top:6px; }

.empty { color:#888; font-style: italic; }
.loading { text-align: center; font-size: 18px; color: #555; margin-top: 40px; }
</style>
