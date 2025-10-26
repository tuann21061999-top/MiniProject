<template>
  <div class="admin-specs">
    <AdminSideBar active="specs" />
    <div class="content">
      <h2>⚙️ Quản lý cấu hình điện thoại</h2>
      <p>Thêm hoặc chỉnh sửa cấu hình chi tiết cho từng điện thoại trong hệ thống.</p>

      <!-- Danh sách điện thoại -->
      <div v-if="phones.length" class="phones-list">
        <div v-for="p in phones" :key="p._id" class="phone-card">
          <div class="info">
            <img :src="p.image || 'https://via.placeholder.com/80'" />
            <div>
              <h3>{{ p.name }}</h3>
              <p><b>Hãng:</b> {{ p.brand }}</p>

              <div v-if="p.specs" class="spec-preview">
                <p><b>OS:</b> {{ p.specs.os || "—" }}</p>
                <p><b>CPU:</b> {{ shortText(p.specs.cpu) }}</p>
                <p><b>Pin:</b> {{ shortText(p.specs.battery) }}</p>
              </div>
            </div>
          </div>

          <button
            :class="p.specs ? 'edit-btn' : 'add-btn'"
            @click="openSpecForm(p)"
          >
            {{ p.specs ? '✏️ Chỉnh sửa cấu hình' : '➕ Thêm cấu hình' }}
          </button>
        </div>
      </div>

      <p v-else class="no-data">❌ Không có điện thoại nào trong cơ sở dữ liệu.</p>

      <!-- Popup form cấu hình -->
      <div v-if="showForm" class="popup-overlay">
        <div class="popup">
          <h3>{{ selectedPhone.specs ? '✏️ Chỉnh sửa cấu hình' : '➕ Thêm cấu hình' }}</h3>
          <p><b>Điện thoại:</b> {{ selectedPhone.name }}</p>

          <div class="form-grid">
            <label>Hệ điều hành:</label>
            <input v-model="form.os" />

            <label>Ngôn ngữ:</label>
            <input v-model="form.language" />

            <label>Màn hình:</label>
            <textarea v-model="form.screen" @input="autoResize"></textarea>

            <label>Camera:</label>
            <textarea v-model="form.camera" @input="autoResize"></textarea>

            <label>CPU:</label>
            <textarea v-model="form.cpu" @input="autoResize"></textarea>

            <label>Bộ nhớ:</label>
            <textarea v-model="form.memory" @input="autoResize"></textarea>

            <label>Thiết kế:</label>
            <textarea v-model="form.design" @input="autoResize"></textarea>

            <label>Pin:</label>
            <textarea v-model="form.battery" @input="autoResize"></textarea>

            <label>Kết nối:</label>
            <textarea v-model="form.connectivity" @input="autoResize"></textarea>

            <label>Giải trí:</label>
            <textarea v-model="form.entertainment" @input="autoResize"></textarea>
          </div>

          <div class="actions">
            <button class="save" @click="saveSpec">💾 Lưu cấu hình</button>
            <button class="cancel" @click="closeForm">❌ Hủy</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import AdminSideBar from "../components/AdminSideBar.vue";

export default {
  name: "AdminSpecs",
  components: { AdminSideBar },
  data() {
    return {
      phones: [],
      showForm: false,
      selectedPhone: {},
      form: {
        os: "",
        language: "",
        screen: "",
        camera: "",
        cpu: "",
        memory: "",
        design: "",
        battery: "",
        connectivity: "",
        entertainment: "",
      },
    };
  },
  methods: {
    // 📱 Lấy danh sách điện thoại
    async fetchPhones() {
      try {
        const res = await axios.get("http://localhost:5000/api/phones");
        this.phones = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("❌ Lỗi tải phones:", err);
        alert("Không thể tải danh sách điện thoại!");
      }
    },

    // 🧩 Hàm chuyển object lồng nhau -> text đẹp
    toText(obj, indent = 0) {
      if (typeof obj !== "object" || obj === null) return obj || "";
      let text = "";
      const space = " ".repeat(indent);
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === "object") {
          text += `${space}${key}:\n${this.toText(val, indent + 2)}\n`;
        } else {
          text += `${space}${key}: ${val}\n`;
        }
      }
      return text.trim();
    },

    // ✏️ Mở form chỉnh sửa / thêm
    async openSpecForm(phone) {
      this.selectedPhone = phone;
      this.showForm = true;

      if (phone.specs && (phone.specs._id || typeof phone.specs === "string")) {
        try {
          const id = phone.specs._id || phone.specs;
          const res = await axios.get(`http://localhost:5000/api/specs/${id}`);
          const specs = res.data;

          this.form = {
            os: specs.os || "",
            language: specs.language || "",
            screen: this.toText(specs.screen),
            camera: this.toText(specs.camera),
            cpu: this.toText(specs.cpu),
            memory: this.toText(specs.memory),
            design: this.toText(specs.design),
            battery: this.toText(specs.battery),
            connectivity: this.toText(specs.connectivity),
            entertainment: this.toText(specs.entertainment),
          };
        } catch (err) {
          console.error("⚠️ Không tìm thấy cấu hình:", err);
          alert("⚠️ Không tìm thấy cấu hình, có thể đã bị xóa.");
        }
      } else {
        // Nếu chưa có specs
        this.form = {
          os: "",
          language: "",
          screen: "",
          camera: "",
          cpu: "",
          memory: "",
          design: "",
          battery: "",
          connectivity: "",
          entertainment: "",
        };
      }

      // Giãn textarea sau khi load
      this.$nextTick(() => {
        document.querySelectorAll("textarea").forEach((el) => this.autoResize({ target: el }));
      });
    },

    // 💾 Lưu cấu hình
    async saveSpec() {
      try {
        const toObject = (text) => {
          try {
            const trimmed = text.trim();
            if (!trimmed) return {};
            return JSON.parse(
              JSON.stringify(
                text
                  .split("\n")
                  .reduce((acc, line) => {
                    const [k, ...v] = line.split(":");
                    if (k && v.length) acc[k.trim()] = v.join(":").trim();
                    return acc;
                  }, {})
              )
            );
          } catch {
            return text;
          }
        };

        const data = {
          os: this.form.os,
          language: this.form.language,
          screen: toObject(this.form.screen),
          camera: toObject(this.form.camera),
          cpu: toObject(this.form.cpu),
          memory: toObject(this.form.memory),
          design: toObject(this.form.design),
          battery: toObject(this.form.battery),
          connectivity: toObject(this.form.connectivity),
          entertainment: toObject(this.form.entertainment),
        };

        if (this.selectedPhone.specs) {
          const id = this.selectedPhone.specs._id || this.selectedPhone.specs;
          await axios.put(`http://localhost:5000/api/specs/${id}`, data);
          alert("✅ Đã cập nhật cấu hình!");
        } else {
          const res = await axios.post("http://localhost:5000/api/specs", data);
          const specId = res.data.specs._id;
          await axios.put(`http://localhost:5000/api/phones/${this.selectedPhone._id}`, { specs: specId });
          alert("✅ Đã thêm cấu hình mới!");
        }

        this.closeForm();
        this.fetchPhones();
      } catch (err) {
        console.error("❌ Lỗi lưu cấu hình:", err);
        alert("Lưu cấu hình thất bại!");
      }
    },

    autoResize(event) {
      const textarea = event.target;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    },

    closeForm() {
      this.showForm = false;
    },

    shortText(val) {
      if (!val) return "—";
      if (typeof val === "object") val = JSON.stringify(val);
      return val.length > 40 ? val.slice(0, 40) + "..." : val;
    },

    formatPrice(v) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);
    },
  },
  mounted() {
    this.fetchPhones();
  },
};
</script>

<style scoped>
.admin-specs {
  display: flex;
  height: 100vh;
  background: #f8fafc;
}
.content {
  flex: 1;
  padding: 30px 40px;
  overflow-y: auto;
}
h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}
.phones-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.phone-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 10px;
  padding: 15px 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.phone-card img {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
}
.phone-card .info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.spec-preview {
  margin-top: 6px;
  background: #f6f9ff;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}
.add-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  cursor: pointer;
}
.edit-btn {
  background: #ff8800;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  cursor: pointer;
}
.add-btn:hover,
.edit-btn:hover {
  opacity: 0.9;
}
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.popup {
  background: #fff;
  padding: 25px 30px;
  border-radius: 10px;
  width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.form-grid {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 12px;
  margin: 15px 0;
}
.form-grid label {
  font-weight: 600;
  color: #444;
}
.form-grid input,
.form-grid textarea {
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  resize: none;
  font-family: monospace;
  white-space: pre-wrap;
  line-height: 1.4;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.actions .save {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
}
.actions .cancel {
  background: #ccc;
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
}
.no-data {
  text-align: center;
  color: #777;
  font-style: italic;
  margin-top: 30px;
}
</style>
