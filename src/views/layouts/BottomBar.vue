<template>
  <nav class="bottom-nav">
    <div class="nav-container">
      <router-link to="/home" class="nav-item" active-class="active">
        <div class="icon-box">
          <i class="fas fa-home"></i>
        </div>
        <span class="label">Accueil</span>
      </router-link>
      
      <router-link to="/catalog" class="nav-item" active-class="active">
        <div class="icon-box">
          <i class="fas fa-shopping-bag"></i>
        </div>
        <span class="label">Catalogue</span>
      </router-link>

      <!-- WhatsApp Button for Customers -->
      <a v-if="!isAdmin" href="#" @click.prevent="openWhatsApp" class="nav-item whatsapp-item">
        <div class="icon-box">
          <i class="fab fa-whatsapp"></i>
        </div>
        <span class="label">Contact</span>
      </a>
      
      <!-- Admin sees Admin Products, Regular users see Cart -->
      <router-link v-if="isAdmin" to="/admin/products" class="nav-item" active-class="active">
        <div class="icon-box">
          <i class="fas fa-cog"></i>
        </div>
        <span class="label">Admin</span>
      </router-link>
      
      <router-link v-else to="/cart" class="nav-item" active-class="active">
        <div class="icon-box">
          <i class="fas fa-shopping-cart"></i>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </div>
        <span class="label">Panier</span>
      </router-link>
      
      <router-link v-if="isAuthenticated" to="/account" class="nav-item" active-class="active">
        <div class="icon-box">
          <i class="fas fa-user"></i>
        </div>
        <span class="label">Compte</span>
      </router-link>
      
      <router-link v-else to="/login" class="nav-item" active-class="active">
        <div class="icon-box">
          <i class="fas fa-sign-in-alt"></i>
        </div>
        <span class="label">Connexion</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const isAuthenticated = computed(() => store.getters.authenticated);
const isAdmin = computed(() => store.getters.isAdmin);
const cartCount = computed(() => store.getters.cartCount);

const openWhatsApp = () => {
  const phoneNumber = '24174222314'; // +241 74 22 23 14
  const message = encodeURIComponent('Bonjour, je souhaite obtenir des informations.');
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.04);
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 65px;
  max-width: 600px;
  margin: 0 auto;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--text-muted);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  position: relative;
}

.icon-box {
  font-size: 1.3rem;
  margin-bottom: 4px;
  transition: transform 0.2s;
  position: relative;
  z-index: 1;
}

.label {
  font-size: 0.7rem;
  font-weight: 500;
  transition: font-weight 0.2s;
}

/* Active State */
.nav-item.active {
  color: var(--ion-color-primary);
}

.nav-item.active .icon-box {
  transform: translateY(-2px);
}

.nav-item.active .label {
  font-weight: 700;
}

/* Cart Badge */
.cart-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: var(--noagab-red);
  color: white;
  font-size: 0.65rem;
  padding: 2px 5px;
  border-radius: 10px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
}

/* Hover effect for desktop */
@media (hover: hover) {
  .nav-item:hover {
    color: var(--ion-color-primary-tint);
  }
}
.whatsapp-item {
  color: #25D366 !important;
}

.whatsapp-item .icon-box {
  background: rgba(37, 211, 102, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  transition: all 0.3s ease;
}

.whatsapp-item:active .icon-box {
  background: rgba(37, 211, 102, 0.2);
  transform: scale(0.95);
}
</style>
