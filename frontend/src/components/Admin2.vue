<template>
  <div class="admin-revenue">
    <AdminSideBar />

    <div class="content">
      <h2>📊 Doanh thu bán hàng</h2>

      <div class="filter-section">
        <label for="monthPicker">Chọn tháng:</label>
        <input
          type="month"
          id="monthPicker"
          v-model="selectedMonth"
          @change="fetchRevenue"
        />
      </div>

      <div class="chart-box">
        <canvas id="revenueChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSideBar from "./AdminSideBar.vue"; // Đường dẫn chính xác abc theo dự án của bạn
import Chart from "chart.js/auto";

export default {
  name: "AdminRevenue",
  components: { AdminSideBar },
  data() {
    return {
      chartInstance: null,
      selectedMonth: this.getCurrentMonth(),
    };
  },
  mounted() {
    this.fetchRevenue();
  },
  methods: {
    getCurrentMonth() {
      const now = new Date();
      const month = now.getMonth() + 1;
      return `${now.getFullYear()}-${month < 10 ? "0" + month : month}`;
    },

    async fetchRevenue() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/stats/revenue?month=${this.selectedMonth}`
        );
        if (!res.ok) throw new Error("Không thể lấy dữ liệu doanh thu");

        const revenueByDate = await res.json();

        const labels = Object.keys(revenueByDate).sort();
        const totals = labels.map((date) => revenueByDate[date]);

        this.drawChart(labels, totals);
      } catch (err) {
        console.error("❌ Lỗi lấy dữ liệu:", err);
      }
    },

    drawChart(labels, totals) {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const ctx = document.getElementById("revenueChart").getContext("2d");
      this.chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Doanh thu (VND)",
              data: totals,
              borderColor: "#27ae60",
              backgroundColor: "rgba(39, 174, 96, 0.2)",
              tension: 0.2,
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y;
                  return new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(value);
                },
              },
            },
          },
          scales: {
            y: {
              ticks: {
                callback: function (value) {
                  return new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(value);
                },
              },
              beginAtZero: true,
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
        },
      });
    },
  },
};
</script>

<style scoped>
.admin-revenue {
  display: flex;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  height: 100vh;
  background: #f4f6f8;
}

.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

h2 {
  margin-bottom: 20px;
}

.filter-section {
  margin-bottom: 25px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-section input[type="month"] {
  padding: 6px 12px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
  cursor: pointer;
}

.chart-box {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgb(0 0 0 / 0.1);
}
</style>
