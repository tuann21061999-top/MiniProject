<template>
  <div class="section card payment-manager">
    <h3>💳 Phương thức thanh toán</h3>

    <ul class="payment-methods">
      <!-- Visa -->
      <li class="method">
        <div class="method-header" @click="openForm('visa')">
          <i class="fab fa-cc-visa visa"></i> Visa
        </div>
        <ul v-if="getAccountsByType('visa').length" class="accounts-list">
          <li
            v-for="(acc, i) in getAccountsByType('visa')"
            :key="'visa'+i"
            :class="{ active: acc.isDefault }"
            @click="setDefaultAccount(acc)"
          >
            {{ acc.display }}
            <span v-if="acc.isDefault" class="check-mark">✅</span>
            <button class="remove-btn" @click.stop="removeAccount(acc)">🗑</button>
          </li>
        </ul>
      </li>

      <!-- MasterCard -->
      <li class="method">
        <div class="method-header" @click="openForm('mastercard')">
          <i class="fab fa-cc-mastercard mastercard"></i> MasterCard
        </div>
        <ul v-if="getAccountsByType('mastercard').length" class="accounts-list">
          <li
            v-for="(acc, i) in getAccountsByType('mastercard')"
            :key="'mc'+i"
            :class="{ active: acc.isDefault }"
            @click="setDefaultAccount(acc)"
          >
            {{ acc.display }}
            <span v-if="acc.isDefault" class="check-mark">✅</span>
            <button class="remove-btn" @click.stop="removeAccount(acc)">🗑</button>
          </li>
        </ul>
      </li>

      <!-- Bank -->
      <li class="method">
        <div class="method-header" @click="openForm('bank')">
          <i class="fas fa-university bank"></i> Ngân hàng
        </div>
        <ul v-if="getAccountsByType('bank').length" class="accounts-list">
          <li
            v-for="(acc, i) in getAccountsByType('bank')"
            :key="'bank'+i"
            :class="{ active: acc.isDefault }"
            @click="setDefaultAccount(acc)"
          >
            <img v-if="acc.logo" :src="acc.logo" class="account-logo" />
            {{ acc.display }}
            <span v-if="acc.isDefault" class="check-mark">✅</span>
            <button class="remove-btn" @click.stop="removeAccount(acc)">🗑</button>
          </li>
        </ul>
      </li>

      <!-- Momo -->
      <li class="method">
        <div class="method-header" @click="openForm('momo')">
          <i class="fas fa-wallet momo"></i> Momo
        </div>
        <ul v-if="getAccountsByType('momo').length" class="accounts-list">
          <li
            v-for="(acc, i) in getAccountsByType('momo')"
            :key="'momo'+i"
            :class="{ active: acc.isDefault }"
            @click="setDefaultAccount(acc)"
          >
            {{ acc.display }}
            <span v-if="acc.isDefault" class="check-mark">✅</span>
            <button class="remove-btn" @click.stop="removeAccount(acc)">🗑</button>
          </li>
        </ul>
      </li>

      <!-- ZaloPay -->
      <li class="method">
        <div class="method-header" @click="openForm('zalopay')">
          <i class="fas fa-wallet zalopay"></i> ZaloPay
        </div>
        <ul v-if="getAccountsByType('zalopay').length" class="accounts-list">
          <li
            v-for="(acc, i) in getAccountsByType('zalopay')"
            :key="'zalopay'+i"
            :class="{ active: acc.isDefault }"
            @click="setDefaultAccount(acc)"
          >
            {{ acc.display }}
            <span v-if="acc.isDefault" class="check-mark">✅</span>
            <button class="remove-btn" @click.stop="removeAccount(acc)">🗑</button>
          </li>
        </ul>
      </li>

      <!-- PayPal -->
      <li class="method">
        <div class="method-header" @click="openForm('paypal')">
          <i class="fab fa-paypal paypal"></i> PayPal
        </div>
        <ul v-if="getAccountsByType('paypal').length" class="accounts-list">
          <li
            v-for="(acc, i) in getAccountsByType('paypal')"
            :key="'pp'+i"
            :class="{ active: acc.isDefault }"
            @click="setDefaultAccount(acc)"
          >
            {{ acc.display }}
            <span v-if="acc.isDefault" class="check-mark">✅</span>
            <button class="remove-btn" @click.stop="removeAccount(acc)">🗑</button>
          </li>
        </ul>
      </li>

      <!-- COD -->
      <li class="method">
        <div class="method-header" @click="selectCOD">
          <i class="fas fa-truck cod"></i> Thanh toán khi nhận hàng (COD)
          <span v-if="selectedMethod === 'cod'" class="check-mark">✅</span>
        </div>
      </li>
    </ul>

    <!-- Popup -->
    <div v-if="showForm" class="overlay">
      <div class="form-popup">
        <h3>Liên kết {{ selectedMethodLabel }}</h3>

        <!-- Visa / MasterCard -->
        <div v-if="selectedMethod === 'visa' || selectedMethod === 'mastercard'">
          <label>Số thẻ (16 số):</label>
          <input
            v-model="formData.cardNumber"
            @input="formData.cardNumber = formData.cardNumber.replace(/\D/g,'').slice(0,16)"
            placeholder="Nhập số thẻ"
          />
          <label>Ngày hết hạn (MM/YY):</label>
          <input v-model="formData.expiry" maxlength="5" placeholder="MM/YY" />
          <label>CVV (3 số):</label>
          <input
            v-model="formData.cvv"
            @input="formData.cvv = formData.cvv.replace(/\D/g,'').slice(0,3)"
            placeholder="CVV"
          />
        </div>

        <!-- Bank -->
        <div v-if="selectedMethod === 'bank'">
          <label>Chọn ngân hàng:</label>
          <div class="bank-list">
            <div
              v-for="bank in banks"
              :key="bank._id"
              class="bank-item"
              :class="{ active: formData.bank === bank.name }"
              @click="selectBank(bank)"
            >
              <img :src="bank.logo" class="bank-logo" />
              <span>{{ bank.name }}</span>
            </div>
          </div>
          <label>Số tài khoản (10-12 số):</label>
          <input
            v-model="formData.accountNumber"
            @input="formData.accountNumber = formData.accountNumber.replace(/\D/g,'').slice(0,12)"
            placeholder="Nhập số tài khoản"
          />
          <label>Tên chủ tài khoản:</label>
          <input v-model="formData.accountName" placeholder="Nhập tên chủ tài khoản" />
        </div>

        <!-- Momo / ZaloPay -->
        <div v-if="selectedMethod === 'momo' || selectedMethod === 'zalopay'">
          <label>Số điện thoại (+84):</label>
          <div class="phone-input">
            <span>+84</span>
            <input
              v-model="formData.phone"
              @input="formData.phone = formData.phone.replace(/\D/g,'').slice(0,9)"
              placeholder="Nhập số (bỏ số 0 đầu)"
            />
          </div>
          <label>Tên chủ ví:</label>
          <input v-model="formData.walletName" placeholder="Nhập tên chủ ví" />
        </div>

        <!-- PayPal -->
        <div v-if="selectedMethod === 'paypal'">
          <label>Email PayPal:</label>
          <input v-model="formData.paypalEmail" type="email" placeholder="Nhập email PayPal" />
        </div>

        <div class="actions">
          <button @click="confirmLink">Liên kết</button>
          <button @click="closeForm" class="cancel">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PaymentManager",
  data() {
    return {
      showForm: false,
      selectedMethod: null,
      linkedAccounts: JSON.parse(localStorage.getItem("linkedAccounts") || "[]"),
      formData: {
        cardNumber: "",
        expiry: "",
        cvv: "",
        bank: "",
        accountNumber: "",
        accountName: "",
        phone: "",
        walletName: "",
        paypalEmail: "",
        logo: "",
      },
      banks: [],
    };
  },
  computed: {
    selectedMethodLabel() {
      const map = {
        visa: "Visa",
        mastercard: "MasterCard",
        bank: "Ngân hàng",
        momo: "Momo",
        zalopay: "ZaloPay",
        paypal: "PayPal",
        cod: "COD",
      };
      return map[this.selectedMethod] || "";
    },
  },
  methods: {
    async fetchBanks() {
      try {
        const res = await axios.get("http://localhost:5000/api/banks");
        this.banks = res.data;
      } catch (err) {
        console.error("❌ Lỗi lấy ngân hàng:", err);
      }
    },
    getAccountsByType(t) {
      return this.linkedAccounts.filter((a) => a.type === t);
    },
    openForm(m) {
      this.showForm = true;
      this.selectedMethod = m;
      this.formData = {
        cardNumber: "",
        expiry: "",
        cvv: "",
        bank: "",
        accountNumber: "",
        accountName: "",
        phone: "",
        walletName: "",
        paypalEmail: "",
        logo: "",
      };
    },
    closeForm() {
      this.showForm = false;
    },
    selectBank(bank) {
      this.formData.bank = bank.name;
      this.formData.logo = bank.logo;
    },
    selectCOD() {
      this.linkedAccounts.forEach((a) => (a.isDefault = false));
      const codAcc = { type: "cod", display: "Thanh toán khi nhận hàng (COD)", isDefault: true };
      const exist = this.linkedAccounts.find((a) => a.type === "cod");
      if (exist) {
        exist.isDefault = true;
      } else {
        this.linkedAccounts.push(codAcc);
      }
      this.selectedMethod = "cod";
      localStorage.setItem("linkedAccounts", JSON.stringify(this.linkedAccounts));
      // ✅ lưu phương thức thanh toán
      localStorage.setItem("paymentMethod", "COD");
      this.showForm = false;
    },
    confirmLink() {
      let display = "";
      if (this.selectedMethod === "visa" || this.selectedMethod === "mastercard") {
        if (this.formData.cardNumber.length !== 16) return alert("❌ Số thẻ phải 16 số");
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.formData.expiry))
          return alert("❌ Ngày hết hạn phải MM/YY");
        if (this.formData.cvv.length !== 3) return alert("❌ CVV phải 3 số");
        display = this.selectedMethodLabel + " ••••" + this.formData.cardNumber.slice(-4);
      }
      if (this.selectedMethod === "bank") {
        if (!this.formData.bank) return alert("❌ Chọn ngân hàng");
        const len = this.formData.accountNumber.length;
        if (len < 10 || len > 12) return alert("❌ STK 10-12 số");
        if (!this.formData.accountName) return alert("❌ Nhập tên chủ tài khoản");
        display = this.formData.bank + " ••••" + this.formData.accountNumber.slice(-2);
      }
      if (this.selectedMethod === "momo" || this.selectedMethod === "zalopay") {
        if (this.formData.phone.length !== 9) return alert("❌ SĐT phải 9 số (bỏ số 0 đầu)");
        if (!this.formData.walletName) return alert("❌ Nhập tên chủ ví");
        display =
          this.selectedMethodLabel +
          " (+84)" +
          this.formData.phone.slice(0, 3) +
          "•••" +
          this.formData.phone.slice(-2);
      }
      if (this.selectedMethod === "paypal") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.paypalEmail))
          return alert("❌ Email PayPal không hợp lệ");
        display = "PayPal • " + this.formData.paypalEmail;
      }

      const newAcc = {
        type: this.selectedMethod,
        display,
        logo: this.formData.logo || null,
        isDefault: true,
      };
      this.linkedAccounts.forEach((a) => (a.isDefault = false));
      this.linkedAccounts.push(newAcc);
      this.selectedMethod = this.selectedMethod;

      localStorage.setItem("linkedAccounts", JSON.stringify(this.linkedAccounts));
      // ✅ lưu phương thức thanh toán chính xác
      localStorage.setItem("paymentMethod", this.selectedMethodLabel);
      this.showForm = false;
    },
    setDefaultAccount(acc) {
      this.linkedAccounts.forEach((a) => (a.isDefault = false));
      acc.isDefault = true;
      this.selectedMethod = acc.type;
      localStorage.setItem("linkedAccounts", JSON.stringify(this.linkedAccounts));
      // ✅ cập nhật lại paymentMethod khi chọn tài khoản
      localStorage.setItem("paymentMethod", this.selectedMethodLabel);
    },
    removeAccount(acc) {
      this.linkedAccounts = this.linkedAccounts.filter((a) => a !== acc);
      if (!this.linkedAccounts.some((a) => a.isDefault) && this.linkedAccounts.length) {
        this.linkedAccounts[0].isDefault = true;
        this.selectedMethod = this.linkedAccounts[0].type;
        localStorage.setItem("paymentMethod", this.selectedMethodLabel);
      }
      if (!this.linkedAccounts.length) {
        this.selectedMethod = null;
        localStorage.removeItem("paymentMethod");
      }
      localStorage.setItem("linkedAccounts", JSON.stringify(this.linkedAccounts));
    },
  },
  mounted() {
    this.fetchBanks();
    // ✅ load lại paymentMethod khi vào
    const pm = localStorage.getItem("paymentMethod");
    if (pm) this.selectedMethod = pm.toLowerCase();
  },
};
</script>



<style scoped>
.payment-manager h3 { color:#ff6600; margin-bottom:10px; }
.payment-methods { list-style:none; padding:0; margin:0; }
.method { margin:8px 0; }
.method-header { cursor:pointer; display:flex; align-items:center; gap:8px; font-weight:bold; transition:0.2s; }
.method-header:hover { color:#ff6600; }
.visa{color:#1a1f71;} .mastercard{color:#eb001b;} .bank{color:#2c3e50;} .momo{color:#a50064;} .zalopay{color:#1e90ff;} .paypal{color:#003087;} .cod{color:#27ae60;}

.accounts-list { list-style:none; margin:6px 0 6px 24px; padding:0; }
.accounts-list li { background:#fff3e0; border:1px solid #ffcc80; padding:6px 10px; border-radius:8px; margin-bottom:6px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; }
.accounts-list li.active { background:#ffe0b2; border-color:#ff9800; }
.account-logo { width:20px; height:20px; margin-right:6px; }
.check-mark { color:#27ae60; margin-left:8px; }
.remove-btn { background:none; border:none; cursor:pointer; font-size:14px; }

.overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:2000; }
.form-popup { background:#fff; padding:20px; border-radius:12px; width:400px; max-height:520px; overflow-y:auto; box-shadow:0 6px 20px rgba(0,0,0,0.25); display:flex; flex-direction:column; gap:14px; }
.form-popup h3 { text-align:center; color:#ff6600; margin-bottom:10px; }
.form-popup label { display:block; margin:10px 0 4px; font-size:14px; font-weight:600; color:#444; }
.form-popup input, .form-popup select { width:100%; padding:10px 14px; margin:6px 0 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box; transition:all 0.2s ease; }
.form-popup input::placeholder { color:#aaa; font-size:13px; }
.form-popup input:focus, .form-popup select:focus { border-color:#ff6600; box-shadow:0 0 0 2px rgba(255,102,0,0.15); }

.phone-input { display:flex; align-items:center; border:1px solid #ddd; border-radius:8px; overflow:hidden; margin:6px 0 12px; }
.phone-input span { background:#f5f5f5; padding:10px; font-size:14px; border-right:1px solid #ddd; color:#333; }
.phone-input input { border:none; flex:1; padding:10px; font-size:14px; outline:none; }

.bank-list { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; max-height:200px; overflow-y:auto; margin:8px 0; padding:8px; border:1px solid #ddd; border-radius:8px; background:#fafafa; }
.bank-item { border:1px solid #ddd; padding:8px; border-radius:8px; display:flex; align-items:center; gap:6px; cursor:pointer; background:#fff; transition:0.2s; }
.bank-item:hover { border-color:#ff6600; background:#fff7ef; transform:translateY(-2px); }
.bank-item.active { border-color:#ff6600; background:#ffe6d1; box-shadow:0 2px 6px rgba(255,102,0,0.25); }
.bank-logo { width:24px; height:24px; object-fit:contain; }

.actions { margin-top:12px; display:flex; justify-content:flex-end; gap:8px; }
.actions button { padding:8px 12px; border:none; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.2s; }
.actions button:first-child { background:#ff6600; color:#fff; }
.actions button:first-child:hover { background:#e65c00; }
.actions .cancel { background:#ccc; }
.actions .cancel:hover { background:#bbb; }
</style>
