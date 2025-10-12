<template>
  <div class="admin-potential-customers">
    <AdminSideBar active="potential-customers" />

    <div class="content">
      <div class="header">
        <h2>👥 Khách hàng tiềm năng</h2>
        <p>Danh sách những khách hàng có tổng giá trị mua hàng cao nhất</p>
      </div>

      <div class="table-container">
        <table class="customers-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Tổng tiền mua</th>
              <th>Tổng số lượng mua</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(customer, index) in customers" :key="customer.email">
              <td>{{ index + 1 }}</td>
              <td>{{ customer.email }}</td>
              <td>{{ customer.fullName }}</td>
              <td>{{ customer.phone }}</td>
              <td class="money">{{ formatCurrency(customer.totalSpent) }}</td>
              <td>{{ customer.totalQuantity }}</td>
            </tr>
            <tr v-if="customers.length === 0">
              <td colspan="6" class="no-data">Không có dữ liệu khách hàng</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSideBar from "../components/AdminSideBar.vue";

export default {
  name: "AdminPotentialCustomers",
  components: { AdminSideBar },
  data() {
    return { customers: [] };
  },
  mounted() {
    this.fetchCustomers();
  },
  methods: {
    async fetchCustomers() {
      try {
        const res = await fetch("http://localhost:5000/api/stats/potential-customers");
        const data = await res.json();
        this.customers = data;
      } catch (err) {
        console.error("❌ Lỗi lấy khách hàng tiềm năng:", err);
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },
  },
};
</script>

<style scoped>
.admin-potential-customers {
  display: flex;
  height: 100vh;
  font-family: "Segoe UI", sans-serif;
  background-color: #f8fafc;
}

/* --- Nội dung chính --- */
.content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.header {
  margin-bottom: 25px;
  background: linear-gradient(135deg, #2980b9, #6dd5fa);
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgb(0 0 0 / 0.15);
}

.header h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.header p {
  margin-top: 4px;
  font-size: 0.95rem;
  opacity: 0.9;
}

/* --- Bảng khách hàng --- */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  overflow: hidden;
}

.customers-table {
  width: 100%;
  border-collapse: collapse;
}

.customers-table th {
  background-color: #2980b9;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
  padding: 14px 16px;
  text-align: left;
}

.customers-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.95rem;
}

.customers-table tr:hover {
  background-color: #f1f8ff;
  transition: 0.2s ease;
}

.money {
  color: #27ae60;
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #888;
  font-style: italic;
}
</style>
