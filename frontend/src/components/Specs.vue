<template>
  <div class="specs-container" v-if="specs">
    <h3>📋 Cấu hình chi tiết</h3>

    <div
      v-for="(value, key) in filteredSpecs"
      :key="key"
      class="spec-section"
    >
      <h4>{{ formatKey(key) }}</h4>

      <!-- Nếu là object (vd: screen, camera, cpu...) -->
      <table v-if="typeof value === 'object' && value !== null">
        <tbody>
          <tr
            v-for="(subValue, subKey, index) in value"
            :key="subKey"
            :class="{ odd: index % 2 === 1 }"
          >
            <td class="subkey">{{ subKey }}</td>
            <td class="subvalue">{{ subValue }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Nếu là chuỗi đơn -->
      <p
        v-else
        class="spec-text"
        :data-label="formatKey(key)"
      >
        {{ value }}
      </p>
    </div>
  </div>

  <p v-else>⏳ Đang tải cấu hình...</p>
</template>

<script>
import axios from "axios";

export default {
  name: "Specs",
  props: ["specsId", "limitTo"],
  data() {
    return { specs: null };
  },
  computed: {
    filteredSpecs() {
      if (!this.specs) return {};
      const ignore = ["_id", "__v", "createdAt", "updatedAt", "model"];
      const filtered = Object.fromEntries(
        Object.entries(this.specs).filter(([key]) => !ignore.includes(key))
      );

      // Nếu có limitTo thì chỉ hiển thị đến key đó
      if (this.limitTo) {
        const keys = Object.keys(filtered);
        const stopIndex = keys.indexOf(this.limitTo);
        if (stopIndex >= 0) {
          const limited = keys.slice(0, stopIndex + 1);
          return Object.fromEntries(
            Object.entries(filtered).filter(([k]) => limited.includes(k))
          );
        }
      }
      return filtered;
    },
  },
  methods: {
    async fetchSpecs() {
      try {
        if (!this.specsId) return;

        const id =
          typeof this.specsId === "object" && this.specsId !== null
            ? this.specsId._id
            : this.specsId;

        if (!id) return;

        const res = await axios.get(`http://localhost:5000/api/specs/${id}`);
        this.specs = res.data;
      } catch (err) {
        console.error("❌ Lỗi tải specs:", err);
      }
    },
    formatKey(key) {
      const upperKeys = [
        "os",
        "cpu",
        "gpu",
        "ram",
        "rom",
        "nfc",
        "wifi",
        "sim",
        "usb",
        "gps",
        "lte",
        "5g",
        "4g",
      ];
      if (upperKeys.includes(key.toLowerCase())) return key.toUpperCase();
      return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
    },
  },
  mounted() {
    this.fetchSpecs();
  },
};
</script>

<style scoped>
.specs-container {
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin-top: 24px;
  animation: fadeIn 0.4s ease;
}

/* --- Tiêu đề chính --- */
.specs-container h3 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #ff6600;
  text-align: center;
  text-shadow: 0 1px 2px rgba(255, 102, 0, 0.15);
}

/* --- Từng nhóm cấu hình --- */
.spec-section {
  margin-bottom: 28px;
  animation: slideUp 0.35s ease;
}
.spec-section h4 {
  color: #ff6600;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  border-bottom: 2px solid #ffe0c2;
  padding-bottom: 4px;
  display: inline-block;
}

/* --- Bảng cấu hình --- */
table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

tr:nth-child(even) {
  background-color: #fafafa;
}
tr:nth-child(odd) {
  background-color: #ffffff;
}
tr:hover {
  background-color: #fff6ee;
  transition: background 0.25s ease;
}

td {
  padding: 10px 16px;
  font-size: 15px;
  vertical-align: middle;
  word-break: break-word;
  line-height: 1.6;
}

/* --- Cột thuộc tính (nghiêng và lệch trái) --- */
.subkey {
  font-weight: 600;
  width: 38%;
  color: #333;
  font-style: italic;
  text-align: left;
  padding-left: 10px;
  border-right: 1px solid #f0f0f0;
}

/* --- Cột giá trị (căn trái chuẩn, đều hàng) --- */
.subvalue {
  color: #444;
  text-align: left;
  padding-left: 18px;
}

/* --- Dạng thuộc tính đơn (OS, Language, …) --- */
.spec-text {
  display: flex;
  align-items: center;
  border-radius: 8px;
  padding: 10px 16px;
  margin-top: 8px;
  font-size: 15px;
  background: linear-gradient(180deg, #fff, #fafafa);
  border: 1px solid #eee;
  transition: 0.25s ease;
}
.spec-text:hover {
  background: #fff7ef;
  box-shadow: 0 2px 8px rgba(255, 102, 0, 0.1);
}
.spec-text::before {
  content: attr(data-label);
  font-weight: 600;
  color: #333;
  font-style: italic;
  width: 38%;
  border-right: 1px solid #f0f0f0;
  padding-right: 10px;
  text-align: left;
}
.spec-text {
  color: #444;
  flex: 1;
  text-align: left;
  padding-left: 18px;
}

/* --- Hiệu ứng xuất hiện --- */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
