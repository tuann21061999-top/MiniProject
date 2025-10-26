<template>
  <div class="admin-orders-page">
    <!-- Sidebar -->
    <AdminSideBar :pendingCount="pendingCount" active="orders" />

    <!-- Nội dung chính -->
    <div class="main-content">
      <h2 class="page-title">📦 Quản lý đơn hàng</h2>

      <!-- Bảng danh sách đơn -->
      <table class="orders-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Ngày tạo</th>
            <th>Phương thức</th>
            <th>Trạng thái</th>
            <th>Tổng tiền</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order._id">
            <td>{{ order._id.slice(-6).toUpperCase() }}</td>
            <td>
              <b>{{ order.fullName }}</b><br />
              <small>{{ order.email }}</small><br />
              <small>{{ order.phone }}</small>
            </td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>{{ order.paymentMethod.toUpperCase() }}</td>
            <td>
              <span :class="['status-badge', order.status]">
                {{ formatStatus(order.status) }}
              </span>
            </td>
            <td>{{ formatPrice(order.total) }}</td>
            <td class="actions">
              <button class="btn view" @click="viewDetails(order)">👁️</button>

              <button
                v-if="order.status === 'waiting_approval'"
                class="btn approve"
                @click="approveOrder(order)"
              >
                ✅ Duyệt
              </button>

              <button
                v-if="!['done', 'cancelled', 'unsuccessful'].includes(order.status)"
                class="btn cancel"
                @click="cancelOrder(order)"
              >
                ❌ Hủy
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="!orders.length" class="empty">Không có đơn hàng nào.</p>

      <!-- Popup chi tiết -->
      <div v-if="showPopup" class="popup-overlay" @click.self="closePopup">
        <div class="popup">
          <h3>📋 Chi tiết đơn hàng</h3>
          <p><b>Mã đơn:</b> {{ selectedOrder._id }}</p>
          <p><b>Khách:</b> {{ selectedOrder.fullName }} ({{ selectedOrder.email }})</p>
          <p><b>Địa chỉ:</b> {{ selectedOrder.shippingAddress }}, {{ selectedOrder.province }}</p>
          <p><b>Điện thoại:</b> {{ selectedOrder.phone }}</p>
          <p><b>Phương thức:</b> {{ selectedOrder.paymentMethod }}</p>
          <p><b>Trạng thái:</b> {{ formatStatus(selectedOrder.status) }}</p>
          <hr />
          <h4>🛍️ Danh sách sản phẩm:</h4>
          <ul>
            <li v-for="(item, i) in selectedOrder.items" :key="i">
              {{ item.name }} - {{ item.color }} - {{ item.storage }} (x{{ item.quantity }})
              → {{ formatPrice(item.price * item.quantity) }}
            </li>
          </ul>
          <hr />
          <p><b>Tổng cộng:</b> {{ formatPrice(selectedOrder.total) }}</p>
          <div class="popup-actions">
            <button @click="closePopup" class="btn close">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import AdminSideBar from "../components/AdminSideBar.vue";

export default {
  name: "AdminOrders",
  components: { AdminSideBar },
  data() {
    return {
      orders: [],
      pendingCount: 0,
      showPopup: false,
      selectedOrder: {},
    };
  },
  methods: {
    async fetchOrders() {
      try {
        const res = await axios.get("http://localhost:5000/api/purchases");
        this.orders = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        // 🔴 Đếm số đơn chờ duyệt
        this.pendingCount = this.orders.filter(
          (o) => o.status === "waiting_approval"
        ).length;
      } catch (err) {
        console.error("❌ Lỗi tải đơn hàng:", err);
      }
    },

    async approveOrder(order) {
      const confirm = await Swal.fire({
        title: "✅ Duyệt đơn hàng?",
        text: "Sau khi duyệt, đơn sẽ bắt đầu được xử lý.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Duyệt",
        cancelButtonText: "Hủy",
      });
      if (!confirm.isConfirmed) return;

      try {
        const res = await axios.put(
          `http://localhost:5000/api/purchases/${order._id}/approve`
        );
        order.status = res.data.order.status;
        Swal.fire("Thành công!", `Đơn đã duyệt (${order.status.toUpperCase()})`, "success");
        this.fetchOrders();
      } catch (err) {
        console.error("❌ Lỗi duyệt đơn:", err);
        Swal.fire("Lỗi", "Không thể duyệt đơn hàng!", "error");
      }
    },

    async cancelOrder(order) {
      const confirm = await Swal.fire({
        title: "❌ Hủy đơn hàng?",
        text: "Thao tác này không thể hoàn tác.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Hủy đơn",
        cancelButtonText: "Đóng",
      });
      if (!confirm.isConfirmed) return;

      try {
        await axios.put(`http://localhost:5000/api/purchases/${order._id}/status`, {
          status: "cancelled",
        });
        order.status = "cancelled";
        Swal.fire("Đã hủy!", "Đơn hàng đã được hủy.", "success");
        this.fetchOrders();
      } catch (err) {
        console.error("❌ Lỗi hủy đơn:", err);
        Swal.fire("Lỗi", "Không thể hủy đơn hàng!", "error");
      }
    },

    viewDetails(order) {
      this.selectedOrder = order;
      this.showPopup = true;
    },

    closePopup() {
      this.showPopup = false;
    },

    formatStatus(s) {
      const map = {
        waiting_approval: "⏳ Chờ duyệt",
        pending: "🚚 Đang giao (COD)",
        paid: "💳 Đã thanh toán (Online)",
        done: "✅ Hoàn tất",
        cancelled: "❌ Đã hủy",
        unsuccessful: "⚠️ Giao thất bại",
      };
      return map[s] || s;
    },
    formatDate(d) {
      return new Date(d).toLocaleString("vi-VN");
    },
    formatPrice(v) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(v || 0);
    },
  },
  mounted() {
    this.fetchOrders();
  },
};
</script>

<style scoped>
.admin-orders-page {
  display: flex;
  background: #f8fafc;
  height: 100vh;
}
.main-content {
  flex: 1;
  padding: 25px 35px;
  overflow-y: auto;
}
.page-title {
  text-align: center;
  color: #ff6600;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
}
.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.orders-table th,
.orders-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
}
.orders-table th {
  background: #f8f9fa;
  color: #444;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 6px;
}
.btn {
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.3s;
}
.btn.view {
  background: #17a2b8;
  color: #fff;
}
.btn.view:hover {
  background: #138496;
}
.btn.approve {
  background: #28a745;
  color: #fff;
}
.btn.approve:hover {
  background: #218838;
}
.btn.cancel {
  background: #dc3545;
  color: #fff;
}
.btn.cancel:hover {
  background: #b02a37;
}
.empty {
  text-align: center;
  color: #777;
  margin-top: 20px;
}
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.popup {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  width: 420px;
  max-height: 90vh;
  overflow-y: auto;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  display: inline-block;
}
.status-badge.waiting_approval { background: #fff3cd; color: #856404; }
.status-badge.pending { background: #cce5ff; color: #004085; }
.status-badge.paid { background: #d4edda; color: #155724; }
.status-badge.done { background: #c3e6cb; color: #155724; }
.status-badge.cancelled { background: #f8d7da; color: #721c24; }
.status-badge.unsuccessful { background: #f5c6cb; color: #721c24; }
</style>
