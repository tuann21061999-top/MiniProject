<template>
  <div class="admin-profit">
    <AdminSideBar active="profit" />

    <div class="content">
      <div class="header">
        <h2>💹 Thống kê lợi nhuận</h2>
        <p>Xem lợi nhuận của cửa hàng theo tháng</p>
      </div>

      <div class="filter-section">
        <label for="monthPicker">Chọn tháng:</label>
        <input type="month" id="monthPicker" v-model="selectedMonth" @change="fetchProfit" />
      </div>

      <div class="summary-box" v-if="summary">
        <p><b>📅 Tháng:</b> {{ summary.month }}</p>
        <p><b>💰 Tổng doanh thu:</b> {{ formatCurrency(summary.totalRevenue) }}</p>
        <p><b>💵 Tổng chi phí (giá nhập):</b> {{ formatCurrency(summary.totalCost) }}</p>
        <p><b>📈 Tổng lợi nhuận:</b> {{ formatCurrency(summary.totalProfit) }}</p>
      </div>

      <div class="chart-box">
        <canvas id="profitChart"></canvas>
      </div>

      <div class="table-container">
        <table class="profit-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng bán</th>
              <th>Doanh thu</th>
              <th>Giá nhập</th>
              <th>Lợi nhuận</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in profits" :key="item.name" class="hover-row">
              <td>{{ i + 1 }}</td>
              <td>
                {{ item.name }}
                <button class="details-btn" @click="showProductOrders(item.name)">🔍 Chi tiết</button>
              </td>
              <td class="quantity">{{ item.qty }}</td>
              <td class="revenue">{{ formatCurrency(item.revenue) }}</td>
              <td class="cost">{{ formatCurrency(item.cost) }}</td>
              <td class="profit">{{ formatCurrency(item.profit) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Popup hiển thị danh sách đơn hàng -->
      <div v-if="showDetails" class="popup-overlay">
        <div class="popup">
          <h3>🧾 Danh sách đơn hàng - {{ selectedProduct }}</h3>
          <table class="details-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Ngày mua</th>
                <th>Số lượng</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in productOrders" :key="o.orderId">
                <td>{{ o.orderId }}</td>
                <td>{{ o.customer }}</td>
                <td>{{ o.email }}</td>
                <td>{{ new Date(o.createdAt).toLocaleDateString() }}</td>
                <td>{{ o.items[0].quantity }}</td>
                <td>{{ formatCurrency(o.total) }}</td>
              </tr>
            </tbody>
          </table>
          <button class="close-btn" @click="showDetails = false">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSideBar from "../components/AdminSideBar.vue";
import Chart from "chart.js/auto";

export default {
  name: "AdminProfit",
  components: { AdminSideBar },
  data() {
    return {
      selectedMonth: this.getCurrentMonth(),
      summary: null,
      profits: [],
      chartInstance: null,
      showDetails: false,
      selectedProduct: "",
      productOrders: [],
    };
  },
  mounted() {
    this.fetchProfit();
  },
  methods: {
    getCurrentMonth() {
      const now = new Date();
      const m = now.getMonth() + 1;
      return `${now.getFullYear()}-${m < 10 ? "0" + m : m}`;
    },
    async fetchProfit() {
      try {
        const res = await fetch(`http://localhost:5000/api/stats/profit?month=${this.selectedMonth}`);
        const data = await res.json();
        this.summary = data;
        this.profits = data.details;
        this.drawChart();
      } catch (err) {
        console.error("❌ Lỗi lấy lợi nhuận:", err);
      }
    },
    async showProductOrders(name) {
      try {
        const res = await fetch(`http://localhost:5000/api/stats/product-orders?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        this.selectedProduct = name;
        this.productOrders = data;
        this.showDetails = true;
      } catch (err) {
        console.error("❌ Lỗi lấy chi tiết đơn hàng:", err);
      }
    },
    drawChart() {
      if (this.chartInstance) this.chartInstance.destroy();
      const ctx = document.getElementById("profitChart").getContext("2d");
      const labels = this.profits.map((p) => p.name);
      const profits = this.profits.map((p) => p.profit);
      this.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Lợi nhuận (VND)",
              data: profits,
              backgroundColor: "#8e44ad",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(ctx.parsed.y),
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (v) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(v),
              },
            },
          },
        },
      });
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value || 0);
    },
  },
};
</script>

<style scoped>
.admin-profit {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
}
.content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}
.header {
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  margin-bottom: 20px;
}
.filter-section {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.summary-box {
  background: white;
  border-radius: 10px;
  padding: 15px 20px;
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.1);
  margin-bottom: 25px;
}
.chart-box {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  margin-bottom: 25px;
}
.profit-table th {
  background-color: #8e44ad;
  color: white;
  padding: 10px;
}
.profit-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.revenue {
  color: #27ae60;
}
.cost {
  color: #c0392b;
}
.profit {
  color: #8e44ad;
  font-weight: bold;
}

/* Hover + Nút chi tiết */
.hover-row:hover {
  background: #f3e9ff;
}
.details-btn {
  background: none;
  border: none;
  color: #8e44ad;
  font-size: 13px;
  margin-left: 6px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}
.hover-row:hover .details-btn {
  opacity: 1;
}

/* Popup chi tiết */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.popup {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  width: 700px;
  max-height: 80vh;
  overflow-y: auto;
}
.popup h3 {
  margin-bottom: 12px;
  color: #8e44ad;
}
.details-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}
.details-table th {
  background: #8e44ad;
  color: white;
  padding: 8px;
}
.details-table td {
  border-bottom: 1px solid #eee;
  padding: 6px;
}
.close-btn {
  background: #8e44ad;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
