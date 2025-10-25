<template>
  <div class="admin-layout">
    <AdminSideBar />

    <main class="main-content">
      <h2>📦 Quản lý sản phẩm</h2>

      <!-- Form thêm sản phẩm -->
      <div class="form-card">
        <h3>➕ Thêm sản phẩm mới</h3>
        <div class="form-grid">
          <input v-model="newProduct.name" placeholder="Tên sản phẩm" />
          <input v-model="newProduct.brand" placeholder="Thương hiệu" />
          <input v-model.number="newProduct.basePrice" type="number" placeholder="Giá cơ bản" />
          <input v-model.number="newProduct.battery" type="number" placeholder="Pin (mAh)" />
          <input v-model="newProduct.sim" placeholder="SIM" />
          <input v-model="newProduct.image" placeholder="Link ảnh sản phẩm" />
        </div>

        <!-- Màu sắc -->
        <div class="mini-section">
          <h4>Màu sắc</h4>
          <div v-for="(c, i) in newProduct.colors" :key="i" class="mini-item">
            <input v-model="c.name" placeholder="Tên màu" />
            <input v-model="c.image" placeholder="Link ảnh màu" />
            <img v-if="c.image" :src="c.image" width="30" height="30" class="thumb" />
            <button @click="removeColor(i)" class="btn-small btn-del">❌</button>
          </div>
          <button @click="addColor" class="btn-small btn-add">+ Thêm màu</button>
        </div>

        <!-- Storage -->
        <div class="mini-section">
          <h4>Bộ nhớ</h4>
          <div v-for="(s, i) in newProduct.storages" :key="i" class="mini-item">
            <input v-model="s.size" placeholder="Dung lượng (vd: 256GB)" />
            <input v-model.number="s.extraPrice" type="number" placeholder="Giá thêm" />
            <input v-model.number="s.importPrice" type="number" placeholder="Giá nhập (VNĐ)" />
            <!-- ✅ THÊM INPUT SỐ LƯỢNG -->
            <input v-model.number="s.quantity" type="number" placeholder="Số lượng" style="width: 80px;" />
            <button @click="newProduct.storages.splice(i, 1)" class="btn-small btn-del">❌</button>
          </div>
          <!-- ✅ CẬP NHẬT HÀM PUSH -->
          <button @click="newProduct.storages.push({ size: '', extraPrice: 0, importPrice: 0, quantity: 0 })" class="btn-small btn-add">+ Thêm dung lượng</button>
        </div>


        <button class="btn-main btn-add" @click="addProduct">Thêm sản phẩm</button>
      </div>

      <!-- Danh sách sản phẩm -->
      <div class="table-card">
        <table class="product-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Hãng</th>
              <th>Giá</th>
              <th>Pin</th>
              <th>SIM</th>
              <th>Màu sắc</th>
              <th>Bộ nhớ / Tồn kho</th> <!-- ✅ SỬA TIÊU ĐỀ -->
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, index) in products" :key="p._id">
              <td><img :src="p.image" width="60" class="thumb" /></td>
              <td>{{ p.name }}</td>
              <td>{{ p.brand }}</td>
              <td>{{ formatPrice(p.basePrice) }}</td>
              <td>{{ p.battery }} mAh</td>
              <td>{{ p.sim }}</td>
              <td>
                <span v-for="c in p.colors" :key="c.name" class="tag">{{ c.name }}</span>
              </td>
              <td>
                <!-- ✅ HIỂN THỊ SỐ LƯỢNG TỒN KHO -->
                <span v-for="s in p.storages" :key="s.size" class="tag">
                  {{ s.size }} (+{{ formatPrice(s.extraPrice) }})  
                  <br />Nhập: {{ formatPrice(s.importPrice) }}
                  <br /><b>Kho: {{ s.quantity || 0 }}</b>
                </span>
              </td>
              <td>
                <button class="btn-small btn-edit" @click="editProduct(index)">✏️</button>
                <button class="btn-small btn-del" @click="deleteProduct(index)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal sửa sản phẩm -->
      <div v-if="editingProduct" class="modal">
        <div class="modal-content">
          <h3>✏️ Sửa sản phẩm</h3>
          <div class="form-grid">
            <input v-model="editingProduct.name" placeholder="Tên sản phẩm" />
            <input v-model="editingProduct.brand" placeholder="Thương hiệu" />
            <input v-model.number="editingProduct.basePrice" type="number" placeholder="Giá cơ bản" />
            <input v-model.number="editingProduct.battery" type="number" placeholder="Pin (mAh)" />
            <input v-model="editingProduct.sim" placeholder="SIM" />
            <input v-model="editingProduct.image" placeholder="Link ảnh sản phẩm" />
          </div>

          <!-- Màu sắc -->
          <div class="mini-section">
            <h4>Màu sắc</h4>
            <div v-for="(c, i) in editingProduct.colors" :key="i" class="mini-item">
              <input v-model="c.name" placeholder="Tên màu" />
              <input v-model="c.image" placeholder="Link ảnh màu" />
              <img v-if="c.image" :src="c.image" width="30" height="30" class="thumb" />
              <button @click="editingProduct.colors.splice(i, 1)" class="btn-small btn-del">❌</button>
            </div>
            <button @click="editingProduct.colors.push({ name: '', image: '' })" class="btn-small btn-add">+ Thêm màu</button>
          </div>

          <!-- Storage -->
          <div class="mini-section">
            <h4>Bộ nhớ</h4>
            <div v-for="(s, i) in editingProduct.storages" :key="i" class="mini-item">
              <input v-model="s.size" placeholder="Dung lượng (vd: 256GB)" />
              <input v-model.number="s.extraPrice" type="number" placeholder="Giá thêm" />
              <input v-model.number="s.importPrice" type="number" placeholder="Giá nhập (VNĐ)" />
              <!-- ✅ THÊM INPUT SỐ LƯỢNG (MODAL) -->
              <input v-model.number="s.quantity" type="number" placeholder="Số lượng" style="width: 80px;" />
              <button @click="editingProduct.storages.splice(i, 1)" class="btn-small btn-del">❌</button>
            </div>
             <!-- ✅ CẬP NHẬT HÀM PUSH (MODAL) -->
            <button @click="editingProduct.storages.push({ size: '', extraPrice: 0, importPrice: 0, quantity: 0 })" class="btn-small btn-add">+ Thêm dung lượng</button>
          </div>

          <div class="modal-actions">
            <button class="btn-main btn-add" @click="saveEdit">💾 Lưu</button>
            <button class="btn-main btn-del" @click="cancelEdit">❌ Hủy</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import AdminSideBar from "./AdminSideBar.vue";

export default {
  name: "Admin",
  components: {
    AdminSideBar,
  },
  data() {
    return {
      products: [],
      newProduct: {
        name: "",
        brand: "",
        basePrice: 0,
        importPrice: 0,
        battery: 0,
        sim: "",
        image: "",
        colors: [],
        storages: [],
      },
      editingIndex: null,
      editingProduct: null,
    };
  },
  created() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const res = await axios.get("http://localhost:5000/api/phones");
        this.products = res.data;
      } catch (err) {
        console.error("❌ Lỗi tải sản phẩm:", err);
      }
    },
    async addProduct() {
      try {
        // ✅ Đảm bảo quantity là số
        this.newProduct.storages.forEach(s => {
          s.quantity = Number(s.quantity) || 0;
        });
        const res = await axios.post("http://localhost:5000/api/phones", this.newProduct);
        this.products.push(res.data);
        this.newProduct = {
          name: "",
          brand: "",
          basePrice: 0,
          battery: 0,
          sim: "",
          image: "",
          colors: [],
          storages: [],
        };
      } catch (err) {
        console.error("❌ Lỗi thêm sản phẩm:", err);
      }
    },
    async deleteProduct(index) {
      const product = this.products[index];
      if (confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
        try {
          await axios.delete(`http://localhost:5000/api/phones/${product._id}`);
          this.products.splice(index, 1);
        } catch (err) {
          console.error("❌ Lỗi xóa sản phẩm:", err);
        }
      }
    },
    editProduct(index) {
      this.editingIndex = index;
      this.editingProduct = JSON.parse(JSON.stringify(this.products[index]));
    },
    async saveEdit() {
      try {
         // ✅ Đảm bảo quantity là số
        this.editingProduct.storages.forEach(s => {
          s.quantity = Number(s.quantity) || 0;
        });
        const edited = this.editingProduct;
        const res = await axios.put(`http://localhost:5000/api/phones/${edited._id}`, edited);
        this.products.splice(this.editingIndex, 1, res.data);
        this.cancelEdit();
      } catch (err) {
        console.error("❌ Lỗi lưu sản phẩm:", err);
      }
    },
    cancelEdit() {
      this.editingIndex = null;
      this.editingProduct = null;
    },
    addColor() {
      this.newProduct.colors.push({ name: "", image: "" });
    },
    removeColor(i) {
      this.newProduct.colors.splice(i, 1);
    },
    addStorage() {
      // Đã bị thay thế bằng @click inline
    },
    removeStorage(i) {
      // Đã bị thay thế bằng @click inline
    },
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
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

.form-card,
.table-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.mini-section {
  margin-bottom: 15px;
}

.mini-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tag {
  display: inline-block;
  background: #007bff;
  color: white;
  border-radius: 20px;
  padding: 3px 10px;
  margin: 2px;
  font-size: 12px;
}

.thumb {
  border-radius: 4px;
  object-fit: cover;
}

.btn-small {
  cursor: pointer;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  user-select: none;
}

.btn-add {
  background: #28a745;
  color: white;
}

.btn-del {
  background: #dc3545;
  color: white;
}

.btn-edit {
  background: #ffc107;
  color: black;
}

.btn-main {
  cursor: pointer;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 16px;
  user-select: none;
}

.btn-main.btn-add {
  background: #007bff;
  color: white;
}

.btn-main.btn-del {
  background: #dc3545;
  color: white;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th,
.product-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-actions {
  margin-top: 15px;
  text-align: right;
}
</style>
