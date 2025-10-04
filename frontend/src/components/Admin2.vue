<script>
import Chart from "chart.js/auto";

export default {
  name: "AdminRevenue",
  data() {
    return {
      chartInstance: null,
    };
  },
  async mounted() {
    try {
      // 📊 Doanh thu
      const res = await fetch("http://localhost:5000/api/stats/revenue");
      const revenueByDate = await res.json();

      const labels = Object.keys(revenueByDate).sort();
      const totals = labels.map(d => revenueByDate[d]);

      this.drawChart(labels, totals);
    } catch (err) {
      console.error("❌ Lỗi lấy dữ liệu:", err);
    }
  },
  methods: {
    drawChart(labels, totals) {
      if (this.chartInstance) this.chartInstance.destroy();

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
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
          },
          scales: {
            y: {
              ticks: {
                callback: function (value) {
                  return new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(value);
                },
              },
            },
          },
        },
      });
    },
  },
};
</script>

<template>
  <div class="admin-revenue">
    <router-link to="/admin" class="btn-manager">📦Quản lý sản phẩm</router-link>
    <h2>📊 Doanh thu bán hàng</h2>
    <div class="chart-box">
      <canvas id="revenueChart"></canvas>
    </div>
  </div>
</template>


<style scoped>
.admin-revenue { padding: 20px; font-family: sans-serif; }
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.btn-back {
  background: #7f8c8d;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
}
.btn-back:hover { background: #606768; }
.import-section { margin-bottom: 20px; }
.file-upload {
  background: #3498db; color: white; padding: 8px 12px;
  border-radius: 6px; cursor: pointer; display: inline-block;
}
.chart-box { max-width: 900px; margin: auto; }
.btn-manager{
  background: #2980b9;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
}
</style>
