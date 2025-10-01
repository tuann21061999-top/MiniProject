<template>
  <div class="promo-page">
    <h1>🎧 Mua iPhone – Nhận ngay AirPods</h1>
    <img class="promo-img" src="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQb2CsQQenNTIqICE0k-Is9JezjFutzFiVeRLSnJRay7fLTiXkymxO3CPMA1iCn3ja7OXTjBwOyXpb3LgU3AGEnEURvb_OQXnMn__tqmB-gejfQc2r1W6bVcgcM0VQeCZqRfqEnQdk&usqp=CAc" alt="AirPods Promo" />
    <p>
      Khi mua các model iPhone 14/15 series, bạn sẽ nhận ngay **AirPods 2 trị giá 3 triệu đồng** 🎁.  
      Đây là cơ hội tuyệt vời để vừa sở hữu iPhone đời mới, vừa có ngay tai nghe AirPods sành điệu.
    </p>
    <ul>
      <li>📱 Áp dụng cho iPhone 14/15 Series</li>
      <li>🎧 Tặng ngay AirPods 2 (giá trị 3.000.000đ)</li>
      <li>⚡ Số lượng có hạn – nhanh tay kẻo lỡ</li>
    </ul>
    <button class="btn-buy" @click="$router.push('/phones')">Mua ngay</button>
  </div>
</template>

<script>
export default {
  name: "AirPodsPromo",
};
</script>

<style scoped>
.promo-page {
  padding: 30px;
  text-align: center;
}
.promo-img {
  max-width: 400px;
  border-radius: 12px;
  margin: 20px auto;
  display: block;
}
.btn-buy {
  margin-top: 20px;
  padding: 12px 24px;
  background: #ff6600;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-buy:hover {
  background: #e65c00;
}
</style>
