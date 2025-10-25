<template>
  <div class="admin-layout">
    <AdminSideBar active="warehouse" />

    <main class="main-content">
      <h2>🏪 Quản lý kho hàng</h2>
      <p>Cập nhật số lượng tồn kho cho từng phiên bản sản phẩm.</p>

      <div class="filter-bar">
        <input v-model="searchQuery" placeholder="🔍 Lọc theo tên sản phẩm..." />
      </div>

      <div class="table-card">
        <table class="warehouse-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Phiên bản (Bộ nhớ)</th>
              <th>Tồn kho hiện tại</th>
              <th>Cập nhật số lượng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <!-- Lặp qua từng sản phẩm -->
            <template v-for="phone in filteredProducts" :key="phone._id">
              <!-- Lặp qua từng phiên bản (storage) của sản phẩm đó -->
              <tr v-for="(storage, s_idx) in phone.storages" :key="storage._id || s_idx">
                <!-- Chỉ hiển thị tên sản phẩm ở hàng đầu tiên của group -->
                <td v-if="s_idx === 0" :rowspan="phone.storages.length" class="phone-name-cell">
                  <img :src="phone.image" width="40" class="thumb" />
                  {{ phone.name }}
                </td>
                
                <td>{{ storage.size }}</td>
                <td class="current-stock">{{ storage.quantity || 0 }}</td>
                
                <!-- Input để cập nhật -->
                <td>
                  <input
                    type="number"
                    v-model.number="storage.newQuantity"
                    placeholder="Nhập số lượng mới"
                    class="stock-input"
                  />
                </td>
                
                <!-- Nút cập nhật -->
                <td>
                  <button
                    class="btn-small btn-save"
                    @click="updateStock(phone, s_idx)"
                    :disabled="storage.newQuantity === undefined || storage.newQuantity === null"
                  >
                    Cập nhật
                  </button>
                </td>
              </tr>
            </template>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="5">Không tìm thấy sản phẩm.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import AdminSideBar from "./AdminSideBar.vue";
import Swal from "sweetalert2"; // Sử dụng thông báo đẹp

export default {
  name: "AdminWarehouse",
  components: {
    AdminSideBar,
  },
  data() {
    return {
      products: [],
      searchQuery: "",
    };
  },
  computed: {
    filteredProducts() {
      if (!this.searchQuery) {
        return this.products;
      }
      const q = this.searchQuery.toLowerCase();
      return this.products.filter(p => p.name.toLowerCase().includes(q));
    }
  },
  created() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const res = await axios.get("http://localhost:5000/api/phones");
        // Gán newQuantity = null để input trống
        this.products = res.data.map(phone => ({
          ...phone,
          storages: phone.storages.map(s => ({ ...s, newQuantity: null }))
        }));
      } catch (err) {
        console.error("❌ Lỗi tải sản phẩm:", err);
      }
    },
    
    async updateStock(phone, storageIndex) {
      const storage = phone.storages[storageIndex];
      const newQuantity = Number(storage.newQuantity);

      if (isNaN(newQuantity) || newQuantity < 0) {
        Swal.fire("Lỗi", "Số lượng phải là một số không âm.", "error");
        return;
      }
      
      // Tạo một bản sao (clone) của sản phẩm để gửi đi
      // Điều này rất QUAN TRỌNG để tránh làm thay đổi dữ liệu gốc trước khi API thành công
      const updatedPhoneData = JSON.parse(JSON.stringify(phone));
      
      // Cập nhật số lượng mới trong bản sao
      updatedPhoneData.storages[storageIndex].quantity = newQuantity;
      
      // Xóa trường newQuantity mà chúng ta tự thêm vào
      updatedPhoneData.storages.forEach(s => delete s.newQuantity);

      try {
        // Gọi API PUT đến /api/phones/:id
        // (API này chúng ta đã có sẵn từ phoneRoutes.js)
        const res = await axios.put(`http://localhost:5000/api/phones/${phone._id}`, updatedPhoneData);

        // Cập nhật UI ngay lập tức
        storage.quantity = newQuantity;
        storage.newQuantity = null; // Reset ô input

        Swal.fire("Thành công!", `Đã cập nhật ${phone.name} - ${storage.size}.`, "success");

      } catch (err) {
        console.error("❌ Lỗi cập nhật kho:", err);
        Swal.fire("Thất bại", "Không thể cập nhật tồn kho. Vui lòng thử lại.", "error");
      }
    },
  },
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
  overflow-y: auto;
}

.filter-bar {
  margin-bottom: 20px;
}
.filter-bar input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}

.table-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
}

.warehouse-table {
  width: 100%;
  border-collapse: collapse;
}

.warehouse-table th,
.warehouse-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
  vertical-align: middle;
}

.warehouse-table th {
  background-color: #f8f8f8;
}

.thumb {
  border-radius: 4px;
  object-fit: cover;
  margin-right: 8px;
  vertical-align: middle;
}

.phone-name-cell {
  font-weight: 600;
  vertical-align: top;
}

.current-stock {
  font-weight: 700;
  font-size: 16px;
  text-align: center;
}

.stock-input {
  width: 150px;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn-small {
  cursor: pointer;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  user-select: none;
}

.btn-save {
  background: #007bff;
  color: white;
  transition: background-color 0.2s;
}
.btn-save:hover {
  background: #0056b3;
}
.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
