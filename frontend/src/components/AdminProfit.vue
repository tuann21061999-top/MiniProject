<template>
  <div class="admin-profit">
    <AdminSideBar active="profit" />
    <div class="content">
      <!-- 🧭 Header -->
      <div class="header">
        <h2>💹 Thống kê lợi nhuận</h2>
        <p>Xem lợi nhuận bán máy hoặc bảo hành theo thời gian</p>
      </div>

      <!-- 🕒 Bộ lọc thời gian -->
      <div class="filter-section">
        <label>Chế độ lọc:</label>
        <select v-model="mode" @change="fetchProfit">
          <option value="day">Theo ngày</option>
          <option value="month">Theo tháng</option>
          <option value="year">Theo năm</option>
        </select>

        <input v-if="mode === 'day'" type="date" v-model="selectedDate" @change="fetchProfit" />
        <input v-if="mode === 'month'" type="month" v-model="selectedMonth" @change="fetchProfit" />
        <input v-if="mode === 'year'" type="number" min="2000" max="2100" v-model="selectedYear" @change="fetchProfit" />
      </div>

      <!-- 📊 Tổng hợp chung -->
      <div class="summary-box" v-if="summary">
        <h3>📑 Tổng hợp lợi nhuận</h3>
        <p><b>🗓️ Thời gian:</b> {{ summary.range }}</p>
        <p><b>💰 Doanh thu:</b> {{ formatCurrency(summary.totalRevenue) }}</p>
        <p><b>💵 Chi phí:</b> {{ formatCurrency(summary.totalCost) }}</p>
        <p><b>📈 Lợi nhuận:</b> {{ formatCurrency(summary.totalProfit) }}</p>
      </div>

      <!-- 🔁 Chuyển chế độ hiển thị -->
      <div class="view-toggle">
        <button :class="{ active: viewMode === 'device' }" @click="changeView('device')">
          📱 Lợi nhuận bán máy
        </button>
        <button :class="{ active: viewMode === 'warranty' }" @click="changeView('warranty')">
          🛡️ Lợi nhuận bảo hành
        </button>
      </div>

      <!-- 📈 Biểu đồ -->
      <div class="chart-box">
        <canvas id="profitChart"></canvas>
      </div>

      <!-- 🧾 Chi tiết -->
      <div class="table-container" v-if="viewMode === 'device'">
        <h3>📱 Lợi nhuận bán máy</h3>
        <div class="export-buttons">
          <button @click="exportExcel('device')">📊 Xuất Excel</button>
          <button @click="exportPDF('device')">📄 Xuất PDF</button>
        </div>

        <table class="profit-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Doanh thu</th>
              <th>Giá nhập</th>
              <th>Lợi nhuận</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in devices" :key="item.name">
              <td>{{ i + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.qty }}</td>
              <td class="revenue">{{ formatCurrency(item.revenue) }}</td>
              <td class="cost">{{ formatCurrency(item.cost) }}</td>
              <td class="profit">{{ formatCurrency(item.profit) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-container" v-else>
        <h3>🛡️ Lợi nhuận bảo hành</h3>
        <div class="warranty-summary">
          <p><b>Thời gian:</b> {{ summary.range }}</p>
          <p><b>Tổng lợi nhuận bảo hành:</b> {{ formatCurrency(warranty.gold.profit + warranty.vip.profit) }}</p>
        </div>
        <div class="export-buttons">
          <button @click="exportExcel('warranty')">📊 Xuất Excel</button>
          <button @click="exportPDF('warranty')">📄 Xuất PDF</button>
        </div>

        <table class="profit-table warranty-table">
          <thead>
            <tr>
              <th>Loại</th>
              <th>Số lượng</th>
              <th>Lợi nhuận</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vàng</td>
              <td>{{ warranty.gold.qty }}</td>
              <td class="profit">{{ formatCurrency(warranty.gold.profit) }}</td>
            </tr>
            <tr>
              <td>VIP</td>
              <td>{{ warranty.vip.qty }}</td>
              <td class="profit">{{ formatCurrency(warranty.vip.profit) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSideBar from "../components/AdminSideBar.vue";
import Chart from "chart.js/auto";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { nextTick } from "vue";

export default {
  name: "AdminProfit",
  components: { AdminSideBar },
  data() {
    return {
      mode: "month",
      selectedDate: new Date().toISOString().slice(0, 10),
      selectedMonth: this.getCurrentMonth(),
      selectedYear: new Date().getFullYear(),
      summary: null,
      devices: [],
      warranty: { gold: { qty: 0, profit: 0 }, vip: { qty: 0, profit: 0 } },
      chartInstance: null,
      viewMode: "device",
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
        let url = "http://localhost:5000/api/stats/profit?";
        if (this.mode === "day") url += `mode=day&date=${this.selectedDate}`;
        else if (this.mode === "month") url += `mode=month&month=${this.selectedMonth}`;
        else if (this.mode === "year") url += `mode=year&year=${this.selectedYear}`;

        const res = await fetch(url);
        const data = await res.json();

        this.summary = data;
        this.devices = data.deviceDetails || [];
        this.warranty = data.warrantyStats || { gold: { qty: 0, profit: 0 }, vip: { qty: 0, profit: 0 } };

        await nextTick();
        this.drawChart();
      } catch (err) {
        console.error("❌ Lỗi lấy dữ liệu:", err);
      }
    },

    async changeView(mode) {
      this.viewMode = mode;
      await nextTick();
      this.drawChart();
    },

    drawChart() {
      const ctx = document.getElementById("profitChart");
      if (!ctx) return;

      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }

      const context = ctx.getContext("2d");
      let labels = [];
      let dataPoints = [];

      if (this.viewMode === "device") {
        labels = this.devices.map((p) => p.name);
        dataPoints = this.devices.map((p) => p.profit);
      } else {
        labels = ["Bảo hành vàng", "Bảo hành VIP"];
        dataPoints = [this.warranty.gold?.profit || 0, this.warranty.vip?.profit || 0];
      }

      this.chartInstance = new Chart(context, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Lợi nhuận (VND)",
              data: dataPoints,
              backgroundColor:
                this.viewMode === "device"
                  ? "rgba(142, 68, 173, 0.8)"
                  : "rgba(241, 196, 15, 0.8)",
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    },

    formatCurrency(v) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(v || 0);
    },

    exportExcel(type) {
      let data = [];
      if (type === "device") {
        data = this.devices.map((d, i) => ({
          STT: i + 1,
          "Tên sản phẩm": d.name,
          "Số lượng": d.qty,
          "Doanh thu": d.revenue,
          "Giá nhập": d.cost,
          "Lợi nhuận": d.profit,
        }));
      } else {
        data = [
          { Loại: "Bảo hành vàng", "Số lượng": this.warranty.gold.qty, "Lợi nhuận": this.warranty.gold.profit },
          { Loại: "Bảo hành VIP", "Số lượng": this.warranty.vip.qty, "Lợi nhuận": this.warranty.vip.profit },
        ];
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Lợi nhuận");
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([buffer]), `Profit_${type}_${this.summary.range}.xlsx`);
    },

    exportPDF(type) {
      const doc = new jsPDF();
      doc.text("Báo cáo lợi nhuận - " + (type === "device" ? "Bán máy" : "Bảo hành"), 14, 16);
      doc.setFontSize(11);
      doc.text("Thời gian: " + this.summary.range, 14, 24);

      const body =
        type === "device"
          ? this.devices.map((d, i) => [
              i + 1,
              d.name,
              d.qty,
              this.formatCurrency(d.revenue),
              this.formatCurrency(d.cost),
              this.formatCurrency(d.profit),
            ])
          : [
              ["Bảo hành vàng", this.warranty.gold.qty, this.formatCurrency(this.warranty.gold.profit)],
              ["Bảo hành VIP", this.warranty.vip.qty, this.formatCurrency(this.warranty.vip.profit)],
            ];

      autoTable(doc, {
        head:
          type === "device"
            ? [["#", "Tên sản phẩm", "Số lượng", "Doanh thu", "Giá nhập", "Lợi nhuận"]]
            : [["Loại", "Số lượng", "Lợi nhuận"]],
        body,
        startY: 30,
      });

      doc.save(`Profit_${type}_${this.summary.range}.pdf`);
    },
  },
};
</script>

<style scoped>
.admin-profit {
  display: flex;
  height: 100vh;
  background: #f8fafc;
}

.content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

/* Header */
.header {
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

/* Bộ lọc thời gian */
.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.filter-section select,
.filter-section input {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

/* Tổng hợp chung */
.summary-box {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

/* Nút chuyển chế độ */
.view-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.view-toggle button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  background: #ddd;
  transition: 0.3s;
}
.view-toggle button.active {
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
  color: white;
}

/* Biểu đồ */
.chart-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  height: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}
.chart-box canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Khung bảng */
.table-container {
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

/* ================================
   BẢNG LỢI NHUẬN
   ================================ */
.profit-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;

  /* Cho phép cột tự co giãn hợp lý thay vì ép đều nhau */
  table-layout: auto;

  /* dùng font số cố định độ rộng để căn phải đẹp */
  font-variant-numeric: tabular-nums;
  font-size: 14px;
  line-height: 1.4;
}

/* Header bảng */
.profit-table thead th {
  background: #d6a6f4;
  color: #fff;
  padding: 10px 12px;
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 2px solid #4a106d;
}

/* Body bảng */
.profit-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  background: #fff;
}

/* Hàng cuối cùng bỏ border dưới cho sạch */
.profit-table tbody tr:last-child td {
  border-bottom: 0;
}

/* ===== CĂN CHỈNH THEO CỘT ===== */

/* # */
.profit-table th:nth-child(1),
.profit-table td:nth-child(1) {
  text-align: center;
  width: 40px;
  min-width: 40px;
  max-width: 50px;
  white-space: nowrap;
}

/* Tên sản phẩm */
.profit-table th:nth-child(2),
.profit-table td:nth-child(2) {
  text-align: left;
  min-width: 220px;
  font-weight: 500;
  color: #2c3e50;
  word-break: break-word;
}

/* Số lượng */
.profit-table th:nth-child(3),
.profit-table td:nth-child(3) {
  text-align: center;
  width: 80px;
  min-width: 80px;
  max-width: 90px;
  white-space: nowrap;
  color: #2c3e50;
  font-weight: 500;
}

/* Doanh thu */
.profit-table th:nth-child(4),
.profit-table td:nth-child(4) {
  text-align: right;
  min-width: 140px;
  max-width: 160px;
  white-space: nowrap;
  font-family: "Courier New", monospace;
  color: #27ae60;
  font-weight: 600;
}

/* Giá nhập */
.profit-table th:nth-child(5),
.profit-table td:nth-child(5) {
  text-align: right;
  min-width: 140px;
  max-width: 160px;
  white-space: nowrap;
  font-family: "Courier New", monospace;
  color: #c0392b;
  font-weight: 600;
}

/* Lợi nhuận */
.profit-table th:nth-child(6),
.profit-table td:nth-child(6) {
  text-align: right;
  min-width: 140px;
  max-width: 160px;
  white-space: nowrap;
  font-family: "Courier New", monospace;
  color: #8e44ad;
  font-weight: 700;
}

/* ================================
   BẢNG BẢO HÀNH
   ================================ */
.warranty-summary {
  background: #fdf5ff;
  padding: 10px;
  border: 1px solid #e5c5ff;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.4;
}

/* ✅ Chia đều 3 cột và canh giữa toàn bộ */
.profit-table.warranty-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Chia đều 3 cột */
  margin-top: 10px;
  font-size: 14px;
}

.profit-table.warranty-table th,
.profit-table.warranty-table td {
  width: 33.33%;
  text-align: center;
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.profit-table.warranty-table th {
  background: #8e44ad;
  color: white;
  font-weight: 600;
  border-bottom: 2px solid #6c2a91;
}

.profit-table.warranty-table td {
  font-weight: 500;
  color: #2c3e50;
  background: #fff;
}

.profit-table.warranty-table td.profit {
  color: #8e44ad;
  font-weight: 700;
  font-family: "Courier New", monospace;
}

/* Nút export */
.export-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.export-buttons button {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.25s;
  font-size: 14px;
}
.export-buttons button:hover {
  background: linear-gradient(135deg, #1e8449, #28b463);
}

</style>

