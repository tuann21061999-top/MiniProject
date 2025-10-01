<template>
  <div class="policy-page">
    <!-- Banner -->
    <div class="policy-hero">
      <h1>📜 Chính sách mua hàng & bảo hành</h1>
      <p>Chúng tôi cam kết mang đến cho bạn trải nghiệm mua sắm tuyệt vời, an tâm về chất lượng và dịch vụ hậu mãi.</p>
    </div>

    <!-- Nội dung chính -->
    <div class="policy-content">
      <!-- Chính sách bảo hành -->
      <section>
        <h2>🛡️ Chính sách bảo hành</h2>
        <ul>
          <li>Bảo hành chính hãng <strong>12 tháng</strong> trên toàn quốc.</li>
          <li><strong>1 đổi 1</strong> trong vòng 30 ngày nếu sản phẩm gặp lỗi từ nhà sản xuất.</li>
          <li>Miễn phí công sửa chữa trong suốt thời gian bảo hành.</li>
        </ul>
      </section>

      <!-- Chính sách vận chuyển -->
      <section>
        <h2>🚚 Chính sách vận chuyển</h2>
        <ul>
          <li>Giao hàng <strong>miễn phí</strong> toàn quốc với đơn từ 1.000.000đ.</li>
          <li>Thời gian giao hàng: 
            <ul>
              <li>TP.HCM & Hà Nội: 1 – 2 ngày</li>
              <li>Tỉnh thành khác: 2 – 5 ngày</li>
            </ul>
          </li>
          <li>Kiểm tra hàng trước khi thanh toán.</li>
        </ul>
      </section>

      <!-- Chính sách đổi trả -->
      <section>
        <h2>🔄 Chính sách đổi trả</h2>
        <ul>
          <li>Đổi trả miễn phí trong vòng <strong>7 ngày</strong> nếu không hài lòng.</li>
          <li>Hỗ trợ hoàn tiền 100% với sản phẩm chưa kích hoạt.</li>
          <li>Hàng trả lại phải còn nguyên tem, nguyên hộp.</li>
        </ul>
      </section>

      <!-- Chính sách thanh toán -->
      <section>
        <h2>💳 Chính sách thanh toán</h2>
        <ul>
          <li>Thanh toán khi nhận hàng (COD).</li>
          <li>Chuyển khoản ngân hàng nhanh chóng, an toàn.</li>
          <li>Hỗ trợ trả góp lãi suất <strong>0%</strong> qua thẻ tín dụng.</li>
        </ul>
      </section>

      <!-- Hỗ trợ khách hàng -->
      <section>
        <h2>📞 Hỗ trợ khách hàng</h2>
        <p>Nếu có bất kỳ thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ:</p>
        <ul>
          <li>Hotline: <strong>1900 1234</strong></li>
          <li>Email: <strong>support@mobilecenter.vn</strong></li>
          <li>Chat trực tuyến 24/7 trên website</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "Policy",
};
</script>

<style scoped>
.policy-page {
  font-family: "Segoe UI", sans-serif;
  color: #333;
  line-height: 1.6;
}

/* Banner chính sách */
.policy-hero {
  background: linear-gradient(135deg, #ff6600, #ff944d);
  color: white;
  text-align: center;
  padding: 60px 20px;
  border-radius: 0 0 40px 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.policy-hero h1 {
  font-size: 36px;
  margin-bottom: 10px;
}
.policy-hero p {
  font-size: 18px;
}

/* Nội dung chính */
.policy-content {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
}
.policy-content section {
  margin-bottom: 40px;
}
.policy-content h2 {
  font-size: 24px;
  color: #ff6600;
  margin-bottom: 12px;
  position: relative;
}
.policy-content h2::after {
  content: "";
  display: block;
  width: 50px;
  height: 3px;
  background: #ff6600;
  margin-top: 6px;
  border-radius: 2px;
}
.policy-content ul {
  margin-left: 20px;
}
.policy-content ul li {
  margin-bottom: 8px;
}
</style>
