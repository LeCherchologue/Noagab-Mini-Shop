<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="cart-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="router.push({ name: 'home' })" color="dark">
            <i class="fas fa-arrow-left"></i>
          </ion-button>
        </ion-buttons>
        <ion-title>Mon Panier</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="cart-content" :fullscreen="true">
      <div class="cart-container">
        <div v-if="loading" class="loading-container">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>

        <div v-else-if="cartItems.length" class="cart-layout">
          <!-- Cart Items List -->
          <div class="cart-items-section">
            <div class="cart-item-card" v-for="item in cartItems" :key="item.product.id">
              <div class="item-image">
                <img :src="item.product.thumbnail" :alt="item.product.title">
              </div>
              <div class="item-details">
                <div class="item-header">
                  <span class="category-tag">{{ item.product.category || 'Produit' }}</span>
                  <h3 class="item-title">{{ item.product.title }}</h3>
                  <p class="item-price">{{ formatPrice(item.product.price, item.product.currency) }}</p>
                </div>
                
                <div class="item-actions">
                  <div class="quantity-control">
                    <button class="qty-btn" @click="decrease(item)">-</button>
                    <span class="qty-value">{{ item.quantity }}</span>
                    <button class="qty-btn" @click="increase(item)">+</button>
                  </div>
                  <button class="remove-btn" @click="remove(item.product.id)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Section -->
          <div class="summary-section">
            <div class="summary-card">
              <h3 class="summary-title">Résumé</h3>
              <div class="summary-row">
                <span>Sous-total</span>
                <span class="amount">{{ formatPrice(cartTotal) }}</span>
              </div>
              <div class="summary-row">
                <span>Livraison</span>
                <span class="amount text-muted">Calculée ensuite</span>
              </div>
              <div class="divider"></div>
              <div class="summary-row total">
                <span>Total</span>
                <span class="amount total-amount">{{ formatPrice(cartTotal) }}</span>
              </div>

              <ion-button 
                expand="block" 
                class="checkout-btn" 
                :disabled="loading"
                @click="checkout"
              >
                Finaliser la commande
              </ion-button>

              <div v-if="checkoutStatus === 'success'" class="status-msg success">
                <i class="fas fa-check-circle"></i> Commande confirmée !
              </div>
              <div v-if="checkoutStatus === 'error'" class="status-msg error">
                <i class="fas fa-exclamation-circle"></i> Le paiement a échoué.
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-shopping-bag"></i>
          </div>
          <h3>Votre panier est vide</h3>
          <p>Découvrez nos produits et commencez vos achats.</p>
          <ion-button class="explore-btn" @click="goToCatalog">
            Explorer la boutique
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonSpinner } from '@ionic/vue';
import type { CartItem } from '../../store';

const store = useStore();
const router = useRouter();

const cartItems = computed<CartItem[]>(() => store.getters.cartItems);
const cartTotal = computed<number>(() => store.getters.cartTotal);
const loading = computed(() => store.getters.appIsLoading);
const checkoutStatus = computed(() => store.getters.checkoutStatus);

const formatPrice = (price: number, currency = 'XOF') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);

const increase = (item: CartItem) => {
  store.dispatch('updateCartQuantity', {
    productId: item.product.id,
    quantity: item.quantity + 1,
  });
};

const decrease = (item: CartItem) => {
  store.dispatch('updateCartQuantity', {
    productId: item.product.id,
    quantity: item.quantity - 1,
  });
};

const remove = (productId: number) => {
  store.dispatch('removeItemFromCart', productId);
};

const checkout = async () => {
  try {
    await store.dispatch('checkoutCart');
    router.push({ name: 'checkout-success' });
  } catch (error) {
    // handled by state
  }
};

const goToCatalog = () => router.push({ name: 'catalog' });
</script>

<style scoped>
.cart-content {
  --background: var(--app-bg);
}

.cart-toolbar {
  --background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color-light);
}

.cart-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .cart-layout {
    grid-template-columns: 2fr 1fr;
  }
}

/* Cart Items */
.cart-items-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: 16px;
  transition: transform 0.2s;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.category-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.item-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 4px 0;
  color: var(--text-primary);
}

.item-price {
  color: var(--noagab-red);
  font-weight: 700;
  margin: 0;
}

.item-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.quantity-control {
  display: flex;
  align-items: center;
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 4px;
}

.qty-btn {
  background: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-primary);
  box-shadow: var(--shadow-xs);
}

.qty-value {
  padding: 0 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  padding: 8px;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: var(--noagab-red);
}

/* Summary */
.summary-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 20px;
}

.summary-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0 0 24px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.amount {
  font-weight: 600;
  color: var(--text-primary);
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 20px 0;
}

.summary-row.total {
  margin-bottom: 24px;
  font-size: 1.1rem;
}

.total-amount {
  color: var(--noagab-red);
  font-weight: 800;
  font-size: 1.3rem;
}

.checkout-btn {
  --background: var(--noagab-green);
  --border-radius: 12px;
  --box-shadow: var(--shadow-green);
  font-weight: 700;
  margin: 0;
}

.status-msg {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-msg.success {
  background: #DCFCE7;
  color: #166534;
}

.status-msg.error {
  background: #FEE2E2;
  color: #991B1B;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: var(--ion-color-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--text-muted);
  margin: 0 auto 24px;
}

.empty-state h3 {
  font-weight: 800;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.explore-btn {
  --background: var(--noagab-red);
  --border-radius: 12px;
  font-weight: 600;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}
</style>
