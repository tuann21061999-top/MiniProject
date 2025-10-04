<template>
  <div class="page-wrapper">
    <!-- Nội dung chính -->
    <div class="phone-page">
      <!-- Sidebar bộ lọc -->
      <aside class="filters">
        <h3>Bộ lọc</h3>

        <!-- Hãng -->
        <div class="filter-section">
          <div class="filter-header" @click="toggleSection('brand')">
            <b>Hãng</b>
            <span>{{ openSections.brand ? "▼" : "▶" }}</span>
          </div>
          <div v-show="openSections.brand" class="filter-body">
            <label v-for="brand in brands" :key="brand">
              <input type="checkbox" :value="brand" v-model="selectedBrands" /> {{ brand }}
            </label>
          </div>
        </div>

        <!-- Giá -->
        <div class="filter-section">
          <div class="filter-header" @click="toggleSection('price')">
            <b>Giá</b>
            <span>{{ openSections.price ? "▼" : "▶" }}</span>
          </div>
          <div v-show="openSections.price" class="filter-body">
            <select v-model="selectedPriceRange">
              <option value="">Tất cả</option>
              <option value="0-5000000">Dưới 5 triệu</option>
              <option value="5000000-10000000">5 - 10 triệu</option>
              <option value="10000000-20000000">10 - 20 triệu</option>
              <option value="20000000-999999999">Trên 20 triệu</option>
            </select>
          </div>
        </div>

        <!-- Màu sắc -->
        <div class="filter-section">
          <div class="filter-header" @click="toggleSection('color')">
            <b>Màu sắc</b>
            <span>{{ openSections.color ? "▼" : "▶" }}</span>
          </div>
          <div v-show="openSections.color" class="filter-body">
            <label v-for="color in colors" :key="color">
              <input type="checkbox" :value="color" v-model="selectedColors" /> {{ color }}
            </label>
          </div>
        </div>

        <!-- Bộ nhớ -->
        <div class="filter-section">
          <div class="filter-header" @click="toggleSection('storage')">
            <b>Bộ nhớ</b>
            <span>{{ openSections.storage ? "▼" : "▶" }}</span>
          </div>
          <div v-show="openSections.storage" class="filter-body">
            <label v-for="storage in storages" :key="storage">
              <input type="checkbox" :value="storage" v-model="selectedStorages" /> {{ storage }}
            </label>
          </div>
        </div>

        <!-- Pin -->
        <div class="filter-section">
          <div class="filter-header" @click="toggleSection('battery')">
            <b>Pin (mAh)</b>
            <span>{{ openSections.battery ? "▼" : "▶" }}</span>
          </div>
          <div v-show="openSections.battery" class="filter-body">
            <input type="number" v-model.number="minBattery" placeholder="Từ" />
            <input type="number" v-model.number="maxBattery" placeholder="Đến" style="margin-top:6px;" />
          </div>
        </div>

        <!-- SIM -->
        <div class="filter-section">
          <div class="filter-header" @click="toggleSection('sim')">
            <b>SIM</b>
            <span>{{ openSections.sim ? "▼" : "▶" }}</span>
          </div>
          <div v-show="openSections.sim" class="filter-body">
            <label><input type="checkbox" value="1" v-model="selectedSim" /> 1 SIM</label>
            <label><input type="checkbox" value="2" v-model="selectedSim" /> 2 SIM</label>
            <label><input type="checkbox" value="e" v-model="selectedSim" /> eSIM</label>
          </div>
        </div>

        <!-- Sắp xếp -->
        <div class="filter-section">
          <div class="filter-header" @click="toggleSection('sort')">
            <b>Sắp xếp theo giá</b>
            <span>{{ openSections.sort ? "▼" : "▶" }}</span>
          </div>
          <div v-show="openSections.sort" class="filter-body">
            <select v-model="sortOrder">
              <option value="">Mặc định</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        <!-- Nút lọc & Reset -->
        <div class="filter-actions">
          <button class="filter-btn" @click="applyFilter">Lọc</button>
          <button class="reset-btn" @click="resetFilter">Reset</button>
        </div>
      </aside>

      <!-- Danh sách điện thoại -->
      <main class="phone-list">
        <h2>Danh sách điện thoại</h2>
        <div class="grid">
          <router-link
            v-for="phone in filteredAndSortedPhones"
            :key="phone._id"
            :to="`/phones/${phone._id}`"
            class="phone-card"
          >
            <img :src="phone.image" alt="phone image" />
            <h4>{{ phone.name }}</h4>
            <p><b>Hãng:</b> {{ phone.brand }}</p>
            <p>{{ phone.description }}</p>
            <p class="price">{{ formatPrice(phone.basePrice) }}</p>
          </router-link>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import axios from "axios";
import Footer from "./Footer.vue";

export default {
  name: "PhoneList",
  components: { Footer },
  data() {
    return {
      allPhones: [],
      displayedPhones: [],
      brands: ["Apple", "Samsung", "Xiaomi", "OPPO", "Vivo", "Realme"],
      colors: ["Đen", "Trắng", "Xanh", "Đỏ", "Vàng"],
      storages: [],
      selectedBrands: [],
      selectedPriceRange: "",
      selectedColors: [],
      selectedStorages: [],
      minBattery: null,
      maxBattery: null,
      selectedSim: [],
      sortOrder: "",
      openSections: {
        brand: true,
        price: true,
        color: true,
        storage: true,
        battery: true,
        sim: true,
        sort: true,
      },
    };
  },
  computed: {
    filteredAndSortedPhones() {
      let result = [...this.displayedPhones];
      if (this.sortOrder === "asc") result.sort((a, b) => a.basePrice - b.basePrice);
      else if (this.sortOrder === "desc") result.sort((a, b) => b.basePrice - a.basePrice);
      return result;
    },
  },
  methods: {
    async fetchPhones() {
      try {
        const res = await axios.get("http://localhost:5000/api/phones");
        this.allPhones = res.data;
        this.displayedPhones = res.data;

        const storageSet = new Set();
        this.allPhones.forEach((phone) => {
          if (phone.storages) {
            phone.storages.forEach((s) => storageSet.add(s.size));
          }
        });
        this.storages = [...storageSet];
      } catch (err) {
        console.error(err);
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
    },
    toggleSection(section) {
      this.openSections[section] = !this.openSections[section];
    },
    applyFilter() {
      this.displayedPhones = this.allPhones.filter((phone) => {
        if (this.selectedBrands.length && !this.selectedBrands.includes(phone.brand)) return false;
        if (this.selectedPriceRange) {
          const [min, max] = this.selectedPriceRange.split("-").map(Number);
          if (phone.basePrice < min || phone.basePrice > max) return false;
        }
        if (this.selectedColors.length && phone.colors) {
          const hasColor = phone.colors.some((c) => this.selectedColors.includes(c.name || c));
          if (!hasColor) return false;
        }
        if (this.selectedStorages.length && phone.storages) {
          const hasStorage = phone.storages.some((s) =>
            this.selectedStorages.includes(s.size || s)
          );
          if (!hasStorage) return false;
        }
        if (this.minBattery && phone.battery < this.minBattery) return false;
        if (this.maxBattery && phone.battery > this.maxBattery) return false;
        if (this.selectedSim.length && !this.selectedSim.includes(phone.sim)) return false;

        return true;
      });
    },
    resetFilter() {
      this.selectedBrands = [];
      this.selectedPriceRange = "";
      this.selectedColors = [];
      this.selectedStorages = [];
      this.minBattery = null;
      this.maxBattery = null;
      this.selectedSim = [];
      this.sortOrder = "";
      this.displayedPhones = [...this.allPhones];
    },
  },
  mounted() {
    this.fetchPhones();
  },
};
</script>

<style scoped>
/* Wrapper */
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Nội dung chính */
.phone-page {
  flex: 1;
  display: flex;
  gap: 22px;
  padding: 20px;
  background: #f7f9fc;
}

/* ===== Sidebar bộ lọc ===== */
.filters {
  width: 250px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 20px;
  align-self: flex-start;
}

.filters h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #222;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
  letter-spacing: 0.3px;
}

/* Mỗi mục bộ lọc */
.filter-section {
  margin-bottom: 14px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  padding: 12px 14px;
  background: #f8f9fa;
  color: #444;
  transition: background 0.25s, color 0.25s;
}
.filter-header:hover {
  background: #eef6ff;
  color: #007bff;
}
.filter-body {
  padding: 12px 16px;
  background: #fff;
  font-size: 14px;
  color: #555;
}
.filter-body label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 6px;
  border-radius: 6px;
  transition: background 0.25s;
}
.filter-body label:hover {
  background: #f5f9ff;
}
.filter-body input[type="checkbox"] {
  accent-color: #007bff;
  width: 16px;
  height: 16px;
}

/* Inputs */
.filter-body select,
.filter-body input[type="number"] {
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  font-size: 14px;
  outline: none;
  transition: border 0.25s, box-shadow 0.25s;
}
.filter-body select:focus,
.filter-body input:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.25);
}

/* Buttons */
.filter-actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}
.filter-btn,
.reset-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}
.filter-btn {
  background: linear-gradient(135deg, #007bff, #3399ff);
  color: #fff;
}
.filter-btn:hover {
  background: linear-gradient(135deg, #0056b3, #1a75ff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
}
.reset-btn {
  background: #f1f1f1;
  color: #333;
}
.reset-btn:hover {
  background: #ddd;
}

/* ===== Phones grid ===== */
.phone-list {
  flex: 1;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

/* Phone card */
.phone-card {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}
.phone-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
.phone-card img {
  width: 85%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}
.phone-card:hover img {
  transform: scale(1.05);
}

/* Tên */
.phone-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 6px 0;
  min-height: 40px;
}
.phone-card:hover h4 {
  color: #ff6600;
}

/* Giá */
.price {
  color: #ff6600;
  font-weight: 700;
  font-size: 15px;
  margin-top: 4px;
}
</style>
