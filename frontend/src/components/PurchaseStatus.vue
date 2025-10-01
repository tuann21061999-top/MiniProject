<template>
  <div class="orders-section card">
    <h3>📦 Lịch sử mua hàng</h3>

    <div v-if="orders.length" class="orders-list">
      <div v-for="order in orders" :key="order._id" class="order-card">
        <!-- Header -->
        <div class="order-header">
          <p><b>Mã đơn:</b> {{ order._id }}</p>
          <p><b>Ngày đặt:</b> {{ new Date(order.createdAt).toLocaleString() }}</p>
        </div>

        <!-- Danh sách sản phẩm -->
        <div class="order-items">
          <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
            <img :src="item.image || 'https://via.placeholder.com/60'" class="item-img" />
            <div class="item-info">
              <p><b>{{ item.name }}</b></p>
              <p>Màu: {{ item.color }} | Bộ nhớ: {{ item.storage }}</p>
              <p>Số lượng: {{ item.quantity }}</p>
              <p class="price">{{ formatPrice(item.price) }}</p>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline" role="group" aria-label="Tiến trình đơn hàng">
          <template v-for="(step, idx) in visibleSteps(order)" :key="idx">
            <div
              class="timeline-step"
              :class="{
                active: idx < visibleSteps(order).length - 1,
                current: idx === visibleSteps(order).length - 1
              }"
            >
              <div class="dot">
                <span>{{ getStepIcon(step) }}</span>
              </div>
              <p class="step-label">{{ step }}</p>
            </div>

            <!-- Connector chỉ nằm giữa các bước -->
            <div
              v-if="idx < visibleSteps(order).length - 1"
              class="timeline-connector"
              :class="{ active: true }"
            />
          </template>
        </div>

        <!-- Footer -->
        <div class="order-footer">
          <p><b>Phương thức:</b> {{ formatPayment(order.paymentMethod) }}</p>
          <p><b>Trạng thái:</b>
            <span :class="['status', order.status]">{{ order.status }}</span>
          </p>
        </div>

        <!-- Bảng giá chi tiết -->
        <div class="price-breakdown">
          <table>
            <tbody>
              <tr>
                <td>💰 Giá sản phẩm</td>
                <td>{{ formatPrice(getItemsPrice(order)) }}</td>
              </tr>
              <tr v-if="order.regionFee">
                <td>🚚 Phí vận chuyển ({{ order.region || '—' }})</td>
                <td>+ {{ formatPrice(order.regionFee) }}</td>
              </tr>
              <tr v-if="order.methodFee">
                <td>🏷️ Dịch vụ giao hàng ({{ order.shippingMethod || '—' }})</td>
                <td>+ {{ formatPrice(order.methodFee) }}</td>
              </tr>
              <tr v-if="order.warrantyFee">
                <td>🛡️ Bảo hành ({{ order.warranty || '—' }})</td>
                <td>+ {{ formatPrice(order.warrantyFee) }}</td>
              </tr>
              <tr class="total-row">
                <td><b>📑 Tổng cộng</b></td>
                <td><b>{{ formatPrice(getTotalPrice(order)) }}</b></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Nút hủy -->
        <div v-if="canCancel(order)" class="cancel-btn">
          <button @click="openCancelPopup(order)">❌ Hủy đơn hàng</button>
        </div>
      </div>
    </div>

    <p v-else>❌ Chưa có đơn hàng nào.</p>

    <!-- Popup hủy -->
    <div v-if="showCancelPopup" class="popup-overlay">
      <div class="popup">
        <h4>Chọn lý do hủy đơn</h4>
        <select v-model="cancelReason">
          <option disabled value="">-- Vui lòng chọn lý do --</option>
          <option>Thay đổi địa chỉ nhận</option>
          <option>Muốn thay đổi phương thức thanh toán</option>
          <option>Không còn nhu cầu mua</option>
          <option>Tìm thấy giá rẻ hơn</option>
        </select>
        <div class="popup-actions">
          <button @click="confirmCancel">✅ Xác nhận hủy</button>
          <button @click="closeCancelPopup">❌ Hủy bỏ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PurchaseStatus",
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || null,
      orders: [],
      showCancelPopup: false,
      cancelReason: "",
      cancelOrder: null,
    };
  },
  methods: {
    async fetchOrders() {
      if (!this.user?.email) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/purchases/user/${this.user.email}`
        );

        this.orders = (res.data || []).map((o) => {
          const timeline = this.getTimeline(o.region || "Khác");
          const savedState = JSON.parse(localStorage.getItem(`order_${o._id}`) || "{}");

          if (savedState.failed) {
            timeline[timeline.length - 1] = "Giao không thành công";
          }

          const { regionFee, methodFee, warrantyFee } = this.computeFees(o);

          return {
            ...o,
            regionFee,
            methodFee,
            warrantyFee,
            timeline,
            currentStep: savedState.currentStep ?? 0,
            nextUpdateTime: savedState.nextUpdateTime || Date.now() + this.randomDelay(),
            failed: savedState.failed || false,
          };
        });

        this.orders.forEach((order) => this.checkProgress(order));
      } catch (err) {
        console.error("❌ Lỗi tải đơn hàng:", err);
      }
    },

    visibleSteps(order) {
      return order.timeline.slice(0, order.currentStep + 1);
    },

    getTimeline(region) {
      let steps = ["Đang chờ xác nhận", "Đã bàn giao cho đơn vị vận chuyển"];
      if (region === "Miền Nam") steps.push("Đến kho trung chuyển số 1");
      else if (region === "Miền Trung")
        steps.push("Đến kho trung chuyển số 1", "Đến kho trung chuyển số 2");
      else if (region === "Miền Bắc")
        steps.push("Đến kho trung chuyển số 1","Đến kho trung chuyển số 2","Đến kho trung chuyển số 3");
      steps.push("Đơn hàng đang trên đường giao", "Chờ xác nhận giao hàng", "Hoàn tất");
      return steps;
    },

    randomDelay() {
      return Math.floor(Math.random() * 5000) + 5000;
    },

    checkProgress(order) {
      const now = Date.now();
      if (order.status === "cancelled" || order.currentStep >= order.timeline.length - 1 || order.failed) return;

      if (now >= order.nextUpdateTime) {
        order.currentStep++;
        this.saveOrderState(order);

        if (order.timeline[order.currentStep] === "Chờ xác nhận giao hàng") {
          this.askDeliveryConfirmation(order);
          return;
        }

        order.nextUpdateTime = Date.now() + this.randomDelay();
        this.saveOrderState(order);
      }

      setTimeout(() => this.checkProgress(order), 2000);
    },

    async askDeliveryConfirmation(order) {
      if (confirm("🚚 Đơn hàng đã đến nơi! Bạn có muốn nhận không?")) {
        order.currentStep = order.timeline.length - 1;
        order.failed = false;
        await this.updateStatus(order._id, "done");
        order.status = "done";
      } else {
        order.timeline[order.timeline.length - 1] = "Giao không thành công";
        order.currentStep = order.timeline.length - 1;
        order.failed = true;
        await this.updateStatus(order._id, "unsuccessful");
        order.status = "unsuccessful";
      }
      this.saveOrderState(order);
    },

    saveOrderState(order) {
      localStorage.setItem(
        `order_${order._id}`,
        JSON.stringify({
          currentStep: order.currentStep,
          nextUpdateTime: order.nextUpdateTime,
          failed: order.failed,
        })
      );
    },

    async updateStatus(orderId, status) {
      try {
        const res = await axios.put(
          `http://localhost:5000/api/purchases/${orderId}/status`,
          { status }
        );
        if (res.data?.success) {
          console.log("✅ Cập nhật trạng thái:", status);
        }
      } catch (err) {
        console.error("❌ Lỗi cập nhật trạng thái:", err);
      }
    },

    computeFees(order) {
      let regionFee = 0;
      if (order.region === "Miền Nam") regionFee = 20000;
      else if (order.region === "Miền Trung") regionFee = 30000;
      else if (order.region === "Miền Bắc") regionFee = 40000;

      let methodFee = 0;
      if (order.shippingMethod === "Viettel Post") methodFee = 10000;
      else if (order.shippingMethod === "Giao Hàng Nhanh") methodFee = 20000;

      let warrantyFee = 0;
      if (order.warranty === "Bảo hành vàng") warrantyFee = 500000;
      else if (order.warranty === "Bảo hành VIP") warrantyFee = 1000000;

      return { regionFee, methodFee, warrantyFee };
    },

    canCancel(order) {
      const currentLabel = order.timeline[order.currentStep];
      return (
        order.status !== "done" &&
        order.status !== "unsuccessful" &&
        order.status !== "cancelled" &&
        currentLabel !== "Chờ xác nhận giao hàng"
      );
    },

    openCancelPopup(order) {
      this.cancelOrder = order;
      this.showCancelPopup = true;
    },
    closeCancelPopup() {
      this.showCancelPopup = false;
      this.cancelReason = "";
      this.cancelOrder = null;
    },
    async confirmCancel() {
      if (!this.cancelReason) {
        alert("⚠️ Vui lòng chọn lý do hủy!");
        return;
      }
      await this.updateStatus(this.cancelOrder._id, "cancelled");
      this.cancelOrder.status = "cancelled";
      this.saveOrderState(this.cancelOrder); // dừng tiến trình
      this.showCancelPopup = false;
      alert("❌ Đơn hàng đã được hủy và dừng xử lý!");
    },

    getItemsPrice(order) {
      return (order.items || []).reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
      );
    },
    getTotalPrice(order) {
      const { regionFee = 0, methodFee = 0, warrantyFee = 0 } = order;
      return this.getItemsPrice(order) + regionFee + methodFee + warrantyFee;
    },

    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value || 0);
    },
    formatPayment(method) {
      if (!method) return "COD";
      return String(method).toUpperCase();
    },

    getStepIcon(step) {
      if (step.includes("chờ xác nhận")) return "⏳";
      if (step.includes("bàn giao")) return "🚚";
      if (step.includes("kho trung chuyển")) return "🏬";
      if (step.includes("trên đường")) return "🛵";
      if (step.includes("Chờ xác nhận giao hàng")) return "🔔";
      if (step.includes("Hoàn tất")) return "✅";
      if (step.includes("không thành công")) return "❌";
      return "⬤";
    },
  },
  mounted() {
    this.fetchOrders();
  },
};
</script>

<style scoped>
/* ===== Card ===== */
.orders-list { display: flex; flex-direction: column; gap: 20px; }
.order-card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
.order-header { display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 12px; }
.order-items { border-top: 1px dashed #ccc; margin-top: 8px; padding-top: 8px; }
.order-item { display: flex; gap: 12px; margin-bottom: 10px; }
.item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
.price { color: #ff6600; font-weight: bold; }

/* ===== Footer ===== */
.order-footer { margin-top: 12px; border-top: 1px solid #eee; padding-top: 8px; font-size: 14px; }
.status { padding: 2px 6px; border-radius: 4px; }
.status.pending { background: #ffc107; color: #000; }
.status.paid { background: #17a2b8; color: #fff; }
.status.done { background: #28a745; color: #fff; }
.status.unsuccessful { background: #dc3545; color: #fff; }
.status.cancelled { background: #6c757d; color: #fff; }

/* ===== Timeline ===== */
.timeline { --dot: 32px; --line: 3px; display: flex; align-items: flex-start; margin: 18px 0 8px; }
.timeline-step { min-width: 100px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; }
.timeline-step .dot { width: var(--dot); height: var(--dot); border-radius: 50%; background: #ccc; display: grid; place-items: center; font-size: 16px; color: #fff; z-index: 2; }
.timeline-step.active .dot { background: #28a745; }
.timeline-step.current .dot { background: #ffc107; color: #000; }
.step-label { font-size: 11px; margin-top: 4px; color: #444; max-width: 90px; line-height: 1.2; white-space: normal; word-wrap: break-word; }
.timeline-connector { flex: 1 1 auto; height: var(--line); background: #ccc; position: relative; top: calc(var(--dot) / 2 - var(--line) / 2); margin-left: calc(var(--dot) / -2); margin-right: calc(var(--dot) / -2); z-index: 1; border-radius: 2px; }
.timeline-connector.active { background: #28a745; }

/* ===== Price breakdown ===== */
.price-breakdown { margin-top: 10px; border-top: 1px solid #eee; padding-top: 8px; }
.price-breakdown table { width: 100%; border-collapse: collapse; font-size: 14px; }
.price-breakdown td { padding: 6px 4px; }
.price-breakdown td:last-child { text-align: right; }
.price-breakdown .total-row td { border-top: 1px dashed #ddd; padding-top: 10px; font-size: 15px; }

/* ===== Cancel button ===== */
.cancel-btn { margin-top: 10px; }
.cancel-btn button { background: #dc3545; color: #fff; padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; transition: 0.3s; }
.cancel-btn button:hover { background: #b02a37; }

/* ===== Popup ===== */
.popup-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.popup { background: #fff; padding: 20px; border-radius: 10px; width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: fadeIn 0.25s ease; }
.popup h4 { margin-bottom: 12px; }
.popup select { width: 100%; padding: 6px; margin-bottom: 14px; border-radius: 6px; border: 1px solid #ccc; }
.popup-actions { display: flex; justify-content: space-between; }
.popup-actions button { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; }
.popup-actions button:first-child { background: #28a745; color: #fff; }
.popup-actions button:last-child { background: #ccc; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
</style>
