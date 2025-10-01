<template>
  <div class="promo-page">
    <h1>♻️ Trade-in – Đổi cũ lấy mới</h1>
    <img class="promo-img" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREypnQ7fpoAcXrlkux--Vsj1tFlHTgtOUaHQ&s" alt="Trade-in" />
    <p>
      Đổi điện thoại cũ của bạn để lấy iPhone mới nhất – tiết kiệm hơn bao giờ hết.  
      Quy trình đơn giản, chỉ mất <strong>5 phút</strong>.
    </p>
    <ul>
      <li>📱 Đổi iPhone cũ lấy iPhone mới</li>
      <li>💰 Giá trị thu cũ lên đời cao</li>
      <li>⚡ Thủ tục nhanh chóng</li>
    </ul>
    <button class="btn-buy" @click="$router.push('/phones')">Mua ngay</button>
  </div>
</template>

<script>
export default {
  name: "TradeInPromo",
};
</script>

<style scoped>
.promo-page {
  padding: 30px;
  text-align: center;
}
.promo-img {
  max-width: 450px;
  border-radius: 12px;
  margin: 20px auto;
  display: block;
}
.btn-buy {
  margin-top: 20px;
  padding: 12px 24px;
  background: #bb4115;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-buy:hover {
  background: #218838;
}
</style>
