<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="router.push({ name: 'catalog' })">
            <ion-icon :icon="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ product?.title ?? 'Produit' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="goToCart">
            <ion-icon :icon="cartOutline"></ion-icon>
            <ion-badge v-if="cartCount > 0" color="danger" class="cart-badge">{{ cartCount }}</ion-badge>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- Main Content with Scroll -->
    <ion-content :fullscreen="true">
      <div v-if="loading || !product" class="loading-container">
        <ion-spinner name="crescent" color="danger"></ion-spinner>
      </div>

      <div v-else class="product-detail-container">
        <!-- Product Image -->
        <div class="product-image-section">
          <img :src="product.thumbnail" :alt="product.title" class="product-image">
        </div>

        <!-- Product Info -->
        <div class="product-info-section">
          <ion-chip color="primary">{{ product.category || 'Collection signature' }}</ion-chip>
          
          <h1 class="product-title">{{ product.title }}</h1>
          <p class="product-description">{{ product.description }}</p>
          
          <div class="price-availability">
            <span class="product-price">{{ formatPrice(product.price, product.currency) }}</span>
            <ion-chip 
              :color="getAvailabilityColor(product)"
            >
              {{ getAvailabilityText(product) }}
            </ion-chip>
          </div>

          <!-- Info Cards -->
          <div class="info-cards-grid">
            <div class="info-card">
              <ion-icon :icon="cubeOutline" color="primary"></ion-icon>
              <small>Stock</small>
              <strong>{{ product.stock }}</strong>
            </div>
            <div class="info-card">
              <ion-icon :icon="pricetagOutline" color="tertiary"></ion-icon>
              <small>Catégorie</small>
              <strong>{{ product.category || 'N/A' }}</strong>
            </div>
            <div class="info-card">
              <ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon>
              <small>Disponibilité</small>
              <strong>{{ product.disponibilite || 'Actif' }}</strong>
            </div>
            <div class="info-card">
              <ion-icon :icon="rocketOutline" color="warning"></ion-icon>
              <small>Livraison</small>
              <strong>48h Express</strong>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="quantity-section">
            <label>Quantité</label>
            <div class="quantity-controls">
              <ion-button fill="outline" @click="decrease" :disabled="quantity <= 1">
                <ion-icon :icon="removeOutline"></ion-icon>
              </ion-button>
              <span class="quantity-value">{{ quantity }}</span>
              <ion-button fill="outline" @click="increase" :disabled="quantity >= product.stock">
                <ion-icon :icon="addOutline"></ion-icon>
              </ion-button>
            </div>
          </div>

          <!-- Add to Cart Button -->
          <ion-button 
            expand="block" 
            color="danger" 
            size="large"
            :disabled="product.stock === 0"
            @click="addToCart"
            class="add-to-cart-btn"
          >
            <ion-icon :icon="cartOutline" slot="start"></ion-icon>
            Ajouter au panier
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonBadge,
  IonChip,
  IonSpinner,
} from '@ionic/vue';
import {
  arrowBack,
  cartOutline,
  cubeOutline,
  pricetagOutline,
  checkmarkCircleOutline,
  rocketOutline,
  addOutline,
  removeOutline,
} from 'ionicons/icons';
import type { Product } from '../../store';

const store = useStore();
const route = useRoute();
const router = useRouter();

const loading = computed(() => store.getters.appIsLoading);
const product = computed<Product | null>(() => store.getters.selectedProduct);
const cartCount = computed(() => store.getters.cartCount);

const quantity = ref(1);
const productId = computed(() => Number(route.params.id));

const formatPrice = (price: number, currency = 'XOF') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);

const getAvailabilityColor = (product: Product | null) => {
  if (!product) return 'medium';
  
  if (product.stock === 0) return 'danger';
  if (product.stock < 5) return 'warning';
  
  const status = product.disponibilite?.toLowerCase();
  if (status === 'rupture' || status === 'indisponible') return 'danger';
  if (status === 'precommande') return 'tertiary';
  
  return 'success';
};

const getAvailabilityText = (product: Product | null) => {
  if (!product) return 'N/A';
  
  if (product.stock === 0) return 'Rupture de stock';
  if (product.stock < 5) return `Stock limité (${product.stock})`;
  
  const status = product.disponibilite?.toLowerCase();
  if (status === 'rupture' || status === 'indisponible') return 'Indisponible';
  if (status === 'precommande') return 'Précommande';
  
  return 'En stock';
};

const goToCart = () => router.push({ name: 'cart' });

const decrease = () => {
  if (quantity.value > 1) quantity.value -= 1;
};

const increase = () => {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value += 1;
  }
};

const addToCart = () => {
  if (!product.value) return;
  store.dispatch('addProductToCart', {
    product: product.value,
    quantity: quantity.value,
  });
  router.push({ name: 'cart' });
};

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      store.dispatch('fetchProductById', Number(newId));
    }
  }
);

onMounted(() => {
  if (!product.value || product.value.id !== productId.value) {
    store.dispatch('fetchProductById', productId.value);
  }
});
</script>

<style scoped>
ion-content {
  --background: var(--app-bg, #f5f5f5);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.product-detail-container {
  padding: 0;
  padding-bottom: 80px;
}

.product-image-section {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: white;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info-section {
  padding: 20px;
}

.product-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 12px 0;
  color: var(--ion-text-color);
}

.product-description {
  color: var(--ion-color-medium);
  line-height: 1.6;
  margin-bottom: 16px;
}

.price-availability {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.product-price {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ion-color-danger);
}

/* Info Cards Grid */
.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.info-card:active {
  transform: scale(0.98);
}

.info-card ion-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.info-card small {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--ion-color-medium);
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.info-card strong {
  display: block;
  font-size: 1.1rem;
  color: var(--ion-text-color);
}

/* Quantity Section */
.quantity-section {
  margin-bottom: 20px;
}

.quantity-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--ion-text-color);
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.quantity-value {
  font-size: 1.5rem;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
  color: var(--ion-text-color);
}

/* Add to Cart Button */
.add-to-cart-btn {
  margin-top: 20px;
  --border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.02em;
}

/* Cart Badge */
.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  font-size: 0.7rem;
}

/* Responsive */
@media (min-width: 768px) {
  .product-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding: 40px 20px;
  }

  .product-image-section {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .info-cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
