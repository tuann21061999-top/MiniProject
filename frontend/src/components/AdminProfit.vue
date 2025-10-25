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

        <input
          v-if="mode === 'day'"
          type="date"
          v-model="selectedDate"
          @change="fetchProfit"
        />
        <input
          v-if="mode === 'month'"
          type="month"
          v-model="selectedMonth"
          @change="fetchProfit"
        />
        <input
          v-if="mode === 'year'"
          type="number"
          min="2000"
          max="2100"
          v-model="selectedYear"
          @change="fetchProfit"
        />
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
        <button
          :class="{ active: viewMode === 'device' }"
          @click="viewMode = 'device'; drawChart()"
        >
          📱 Lợi nhuận bán máy
        </button>
        <button
          :class="{ active: viewMode === 'warranty' }"
          @click="viewMode = 'warranty'; drawChart()"
        >
          🛡️ Lợi nhuận bảo hành
        </button>
      </div>

      <!-- 📈 Biểu đồ -->
      <div class="chart-box">
        <canvas id="profitChart"></canvas>
      </div>

      <!-- 🧾 Chi tiết theo chế độ -->
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

        <!-- 🔸 Tổng hợp riêng cho bảo hành -->
        <div class="warranty-summary">
          <p><b>Thời gian:</b> {{ summary.range }}</p>
          <p>
            <b>Tổng lợi nhuận bảo hành:</b>
            {{ formatCurrency(warranty.gold.profit + warranty.vip.profit) }}
          </p>
        </div>

        <div class="export-buttons">
          <button @click="exportExcel('warranty')">📊 Xuất Excel</button>
          <button @click="exportPDF('warranty')">📄 Xuất PDF</button>
        </div>

        <table class="profit-table">
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
        else if (this.mode === "month")
          url += `mode=month&month=${this.selectedMonth}`;
        else if (this.mode === "year") url += `mode=year&year=${this.selectedYear}`;

        const res = await fetch(url);
        const data = await res.json();

        this.summary = data;
        this.devices = data.deviceDetails || [];
        this.warranty = data.warrantyStats || {
          gold: { qty: 0, profit: 0 },
          vip: { qty: 0, profit: 0 },
        };
        this.drawChart();
      } catch (err) {
        console.error("❌ Lỗi lấy dữ liệu:", err);
      }
    },
    drawChart() {
      if (this.chartInstance) this.chartInstance.destroy();
      const ctx = document.getElementById("profitChart").getContext("2d");

      let labels = [],
        dataPoints = [];
      if (this.viewMode === "device") {
        labels = this.devices.map((p) => p.name);
        dataPoints = this.devices.map((p) => p.profit);
      } else {
        labels = ["Bảo hành vàng", "Bảo hành VIP"];
        dataPoints = [
          this.warranty.gold?.profit || 0,
          this.warranty.vip?.profit || 0,
        ];
      }

      this.chartInstance = new Chart(ctx, {
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

    // 📤 Xuất Excel
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

    // 📄 Xuất PDF
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
.header {
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}
.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}
.summary-box {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}
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
.chart-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.table-container {
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}
.profit-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.profit-table th {
  background: #8e44ad;
  color: white;
  padding: 8px;
}
.profit-table td {
  padding: 8px;
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
.warranty-summary {
  background: #fdf5ff;
  padding: 10px;
  border: 1px solid #e5c5ff;
  border-radius: 8px;
  margin-bottom: 10px;
}
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
}
.export-buttons button:hover {
  background: linear-gradient(135deg, #1e8449, #28b463);
}
</style>
