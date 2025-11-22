<template>
  <MyTemplate>
    <template #content>
      <ion-page>
        <!-- Fixed Header with Search and Filters -->
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <div class="header-content">
              <div class="header-top">
                <h1>Catalogue</h1>
                <ion-button fill="clear" class="cart-btn" @click="goToCart">
                  <i class="fas fa-shopping-cart"></i>
                  <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
                </ion-button>
              </div>
            </div>
          </ion-toolbar>
          
          <!-- Search Bar -->
          <ion-toolbar>
            <div class="search-bar">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                placeholder="Rechercher un produit..." 
                v-model="query"
              >
            </div>
          </ion-toolbar>

          <!-- Filters -->
          <ion-toolbar>
            <div class="filters-scroll">
              <button 
                v-for="filter in availableFilters" 
                :key="filter"
                class="filter-chip"
                :class="{ active: query === filter }"
                @click="applyFilter(filter)"
              >
                {{ filter }}
              </button>
              <button 
                class="filter-chip clear" 
                v-if="query" 
                @click="query = ''"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </ion-toolbar>
        </ion-header>

        <!-- Scrollable Products Content -->
        <ion-content :fullscreen="false">
          <!-- Products Grid -->
          <div class="products-container">
            <div class="products-grid" v-if="filteredProducts.length">
              <div 
                class="product-card" 
                v-for="product in filteredProducts" 
                :key="product.id"
                @click="openProduct(product.id)"
              >
                <div class="card-image">
                  <img :src="product.thumbnail" :alt="product.title">
                  <div class="stock-badge" v-if="product.stock < 5 && product.stock > 0">
                    <i class="fas fa-bolt"></i> Vite !
                  </div>
                  <div class="stock-badge out-of-stock" v-if="product.stock === 0">
                    <i class="fas fa-times-circle"></i> Rupture
                  </div>
                </div>
                <div class="card-details">
                  <span class="category">{{ product.category || 'Collection' }}</span>
                  <h3>{{ product.title }}</h3>
                  <div class="availability-info" v-if="product.disponibilite">
                    <span class="availability-badge" :class="getDisponibiliteClass(product.disponibilite)">
                      {{ product.disponibilite }}
                    </span>
                  </div>
                  <div class="price-row">
                    <span class="price">{{ formatPrice(product.price, product.currency) }}</span>
                    <ion-button 
                      fill="clear" 
                      class="add-btn" 
                      @click.stop="addToCart(product)"
                      :disabled="product.stock === 0"
                    >
                      <i class="fas fa-plus"></i>
                    </ion-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <ion-spinner name="crescent" color="primary"></ion-spinner>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && !filteredProducts.length" class="empty-state">
              <div class="empty-icon">
                <i class="fas fa-search"></i>
              </div>
              <h3>Aucun résultat</h3>
              <p>Essayez d'autres mots-clés</p>
            </div>
          </div>
        </ion-content>
      </ion-page>
    </template>
  </MyTemplate>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { IonContent, IonButton, IonSpinner, IonPage, IonHeader, IonToolbar } from '@ionic/vue';
import MyTemplate from '../layouts/MyTemplate.vue';
import type { Product } from '../../store';

const store = useStore();
const router = useRouter();

const query = ref('');
const loading = computed(() => store.getters.appIsLoading);
const cartCount = computed(() => store.getters.cartCount);
const products = computed<Product[]>(() => store.getters.products);
const availableFilters = ['Lifestyle', 'Tech', 'Éco', 'Luxe'];

const filteredProducts = computed(() => {
  if (!query.value) {
    return products.value;
  }

  return products.value.filter((product) => {
    const payload = `${product.title} ${product.description} ${product.category}`.toLowerCase();
    return payload.includes(query.value.toLowerCase());
  });
});

const formatPrice = (price: number, currency = 'XOF') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);

const getDisponibiliteClass = (disponibilite: string) => {
  const status = disponibilite.toLowerCase();
  if (status.includes('rupture') || status.includes('indisponible')) return 'unavailable';
  if (status.includes('precommande')) return 'preorder';
  return 'available';
};

const openProduct = (productId: number) => {
  router.push({ name: 'product-detail', params: { id: productId } });
};

const addToCart = (product: Product) => {
  store.dispatch('addProductToCart', { product });
};

const goToCart = () => router.push({ name: 'cart' });

const applyFilter = (filter: string) => {
  query.value = query.value === filter ? '' : filter;
};

onMounted(() => {
  if (!products.value.length) {
    store.dispatch('fetchProducts');
  }
});
</script>

<style scoped>
ion-content {
  --background: var(--app-bg);
}

ion-header {
  background: var(--app-bg);
}

ion-toolbar {
  --background: var(--app-bg);
  --border-width: 0;
  --padding-start: 0;
  --padding-end: 0;
}

/* Header Content */
.header-content {
  padding: 0 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.header-top h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cart-btn {
  position: relative;
  --color: var(--text-primary);
  font-size: 1.2rem;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--noagab-red);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 700;
}

/* Search Bar */
.search-bar {
  position: relative;
  padding: 0 20px 12px;
}

.search-icon {
  position: absolute;
  left: 36px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-bar input {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: none;
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  font-size: 1rem;
  color: var(--text-primary);
  transition: box-shadow 0.2s;
}

.search-bar input:focus {
  outline: none;
  box-shadow: var(--shadow-md);
}

/* Filters */
.filters-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 20px 12px;
  scrollbar-width: none;
}

.filters-scroll::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  background: white;
  border: 1px solid var(--border-color-light);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-chip.active {
  background: var(--noagab-red);
  color: white;
  border-color: var(--noagab-red);
  box-shadow: var(--shadow-red);
}

.filter-chip.clear {
  padding: 8px 12px;
  color: var(--text-muted);
}

/* Products Container */
.products-container {
  padding: 20px;
  padding-bottom: 80px;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.product-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s;
  cursor: pointer;
}

.product-card:active {
  transform: scale(0.98);
}

.card-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stock-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--noagab-red);
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-details {
  padding: 12px;
}

.category {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.product-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 4px 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: 800;
  color: var(--text-primary);
}

.add-btn {
  --padding-start: 8px;
  --padding-end: 8px;
  height: 32px;
  --color: var(--noagab-green);
  margin: 0;
}

.add-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Availability Info */
.availability-info {
  margin: 6px 0;
}

.availability-badge {
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.availability-badge.available {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.availability-badge.unavailable {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.availability-badge.preorder {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.stock-badge.out-of-stock {
  background: rgba(220, 53, 69, 0.95);
  color: white;
}

/* States */
.loading-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}
</style>
