<template>
  <div class="floating-cart" @click="goToCart">
    <i class="fas fa-shopping-cart"></i>
    <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState({
      cartCount: state => state.cart.length
    })
  },
  methods: {
    goToCart() {
      this.$router.push("/cart");
    }
  }
};
</script>

<style scoped>
.floating-cart {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #ff6600;
  color: #fff;
  font-size: 26px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 9999;
}
.floating-cart:hover {
  transform: scale(1.1);
}
.cart-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: red;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 50%;
}
</style>
