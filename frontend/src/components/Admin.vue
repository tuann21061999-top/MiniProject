<template>
  <div class="admin-products">
    <router-link to="/admin2" class="btn-revenue">📊 Xem doanh thu</router-link>
    <h2>📦 Quản lý sản phẩm</h2>

    <!-- Import / Export -->
    <div class="import-section">
      <label class="file-upload">
        📂 Import JSON
        <input type="file" @change="importProducts" accept=".json" hidden />
      </label>
      <button class="btn-export" @click="exportJSON">💾 Xuất JSON</button>
    </div>

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
          <button type="button" @click="removeColor(i)" class="btn-small btn-del">❌</button>
        </div>
        <button type="button" @click="addColor" class="btn-small btn-add">+ Thêm màu</button>
      </div>

      <!-- Storage -->
      <div class="mini-section">
        <h4>Bộ nhớ</h4>
        <div v-for="(s, i) in newProduct.storages" :key="i" class="mini-item">
          <input v-model="s.size" placeholder="Dung lượng (vd: 128GB)" />
          <input v-model.number="s.extraPrice" type="number" placeholder="Giá thêm" />
          <button type="button" @click="removeStorage(i)" class="btn-small btn-del">❌</button>
        </div>
        <button type="button" @click="addStorage" class="btn-small btn-add">+ Thêm dung lượng</button>
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
            <th>Bộ nhớ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, index) in products" :key="p.id">
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
              <span v-for="s in p.storages" :key="s.size" class="tag">
                {{ s.size }} (+{{ formatPrice(s.extraPrice) }})
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
            <button @click="editingProduct.colors.splice(i,1)" class="btn-small btn-del">❌</button>
          </div>
          <button @click="editingProduct.colors.push({name:'',image:''})" class="btn-small btn-add">+ Thêm màu</button>
        </div>

        <!-- Storage -->
        <div class="mini-section">
          <h4>Bộ nhớ</h4>
          <div v-for="(s, i) in editingProduct.storages" :key="i" class="mini-item">
            <input v-model="s.size" placeholder="Dung lượng" />
            <input v-model.number="s.extraPrice" type="number" placeholder="Giá thêm" />
            <button @click="editingProduct.storages.splice(i,1)" class="btn-small btn-del">❌</button>
          </div>
          <button @click="editingProduct.storages.push({size:'',extraPrice:0})" class="btn-small btn-add">+ Thêm dung lượng</button>
        </div>

        <div class="modal-actions">
          <button class="btn-main btn-add" @click="saveEdit">💾 Lưu</button>
          <button class="btn-main btn-del" @click="cancelEdit">❌ Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminProducts",
  data() {
    return {
      products: [],
      newProduct: {
        id: null, name: "", brand: "", basePrice: "",
        battery: "", sim: "", image: "",
        colors: [], storages: []
      },
      editingIndex: null,
      editingProduct: null
    };
  },
  methods: {
    importProducts(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try { this.products = JSON.parse(ev.target.result); }
        catch { alert("❌ File JSON không hợp lệ"); }
      };
      reader.readAsText(file);
    },
    exportJSON() {
      const data = JSON.stringify(this.products, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "products.json"; a.click();
      URL.revokeObjectURL(url);
    },
    addProduct() {
      this.newProduct.id = Date.now();
      this.products.push(JSON.parse(JSON.stringify(this.newProduct)));
      this.newProduct = { id:null,name:"",brand:"",basePrice:0,battery:0,sim:"",image:"",colors:[],storages:[] };
    },
    deleteProduct(i) { this.products.splice(i, 1); },
    editProduct(i) {
      this.editingIndex = i;
      this.editingProduct = JSON.parse(JSON.stringify(this.products[i]));
    },
    saveEdit() {
      this.products[this.editingIndex] = JSON.parse(JSON.stringify(this.editingProduct));
      this.cancelEdit();
    },
    cancelEdit() {
      this.editingIndex = null;
      this.editingProduct = null;
    },
    addColor() { this.newProduct.colors.push({ name: "", image: "" }); },
    removeColor(i) { this.newProduct.colors.splice(i, 1); },
    addStorage() { this.newProduct.storages.push({ size: "", extraPrice: 0 }); },
    removeStorage(i) { this.newProduct.storages.splice(i, 1); },
    formatPrice(v) {
      return new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(v);
    }
  }
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.btn-revenue {
  background: #2980b9;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
}
.btn-revenue:hover {
  background: #1f6391;
}
.admin-products { padding: 20px; font-family: sans-serif; }
h2 { margin-bottom: 15px; }
.import-section { margin-bottom: 20px; display: flex; gap: 10px; }
.file-upload {
  background: #de5708; color: white; padding: 8px 12px;
  border-radius: 6px; cursor: pointer; display: inline-block;
}
.btn-export {
  background: #d3730d; color: white; padding: 8px 12px;
  border: none; border-radius: 6px; cursor: pointer;
}
.form-card, .table-card {
  background: #fff; padding: 15px; border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin-bottom: 20px;
}
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.form-grid input, .mini-item input {
  width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 5px;
}
.mini-section { margin-top: 10px; background: #f9f9f9; padding: 10px; border-radius: 6px; }
.mini-item { display: flex; gap: 5px; margin-bottom: 5px; align-items: center; }
.btn-main { padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; }
.btn-add { background: #db9d20; color: white; }
.btn-del { background: #e74c3c; color: white; }
.btn-edit { background: #f1c40f; color: white; }
.btn-small { font-size: 12px; padding: 4px 6px; border-radius: 5px; border: none; cursor: pointer; }
.product-table { width: 100%; border-collapse: collapse; }
.product-table th, .product-table td {
  border: 1px solid #ddd; padding: 8px; text-align: center;
}
.product-table th { background: #333; color: #fff; }
.product-table tr:nth-child(even) { background: #f9f9f9; }
.thumb { border-radius: 6px; }
.tag {
  display: inline-block; margin: 2px; padding: 2px 6px;
  background: #eee; border-radius: 5px; font-size: 12px;
}
.modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
}
.modal-content {
  background: #fff; padding: 20px; border-radius: 8px;
  width: 500px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
</style>
