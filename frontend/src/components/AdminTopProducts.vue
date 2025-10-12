<template>
  <div class="admin-top-products">
    <AdminSideBar active="top-products" />

    <div class="content">
      <div class="header">
        <h2>📊 Sản phẩm bán chạy nhất</h2>
        <p>Thống kê những sản phẩm có doanh số cao nhất hệ thống</p>
      </div>

      <div class="table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng bán</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in products" :key="product.name">
              <td>{{ index + 1 }}</td>
              <td>{{ product.name }}</td>
              <td class="qty">{{ product.qty }}</td>
            </tr>
            <tr v-if="products.length === 0">
              <td colspan="3" class="no-data">Không có dữ liệu sản phẩm</td>
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
  name: "AdminTopProducts",
  components: { AdminSideBar },
  data() {
    return { products: [] };
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const res = await fetch("http://localhost:5000/api/stats/top-products");
        const data = await res.json();
        this.products = data;
      } catch (err) {
        console.error("❌ Lỗi lấy top sản phẩm:", err);
      }
    },
  },
};
</script>

<style scoped>
.admin-top-products {
  display: flex;
  height: 100vh;
  font-family: "Segoe UI", sans-serif;
  background-color: #f8fafc;
}

.content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.header {
  margin-bottom: 25px;
  background: linear-gradient(135deg, #27ae60, #6dd5fa);
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

/* --- Bảng sản phẩm --- */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  overflow: hidden;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th {
  background-color: #27ae60;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
  padding: 14px 16px;
  text-align: left;
}

.products-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.95rem;
}

.products-table tr:hover {
  background-color: #f1fff3;
  transition: 0.2s ease;
}

.qty {
  color: #2980b9;
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #888;
  font-style: italic;
}
</style>
