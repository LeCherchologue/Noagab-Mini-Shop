<template>
  <MyTemplate>
    <template #content>
      <ion-content :fullscreen="true" class="home-content">
        <div class="content-container">
          
          <!-- Hero Section -->
          <section class="hero-section" v-if="featuredProduct">
            <div class="hero-bg"></div>
            <div class="hero-content">
              <span class="badge-pill">Produit Vedette</span>
              <h1 class="hero-title">{{ featuredProduct.title }}</h1>
              <p class="hero-desc">{{ featuredProduct.description }}</p>
              
              <div class="hero-actions">
                <div class="price-tag">
                  <span class="label">À partir de</span>
                  <span class="price">{{ formatPrice(featuredProduct.price, featuredProduct.currency) }}</span>
                </div>
                <ion-button class="explore-btn" @click="openProduct(featuredProduct.id)">
                  Découvrir
                  <i class="fas fa-arrow-right ml-2"></i>
                </ion-button>
              </div>
            </div>
            <div class="hero-image-container d-none d-md-block">
               <!-- Placeholder for hero image if available -->
               <div class="stock-badge">
                  <i class="fas fa-check-circle mr-1"></i>
                  Stock: {{ featuredProduct.stock }}
               </div>
            </div>
          </section>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card" v-for="stat in highlightStats" :key="stat.label">
              <div class="stat-icon">
                <i class="fas fa-chart-line" v-if="stat.label.includes('Nouveaux')"></i>
                <i class="fas fa-box-open" v-if="stat.label.includes('Commandes')"></i>
                <i class="fas fa-star" v-if="stat.label.includes('Satisfaction')"></i>
              </div>
              <div class="stat-info">
                <h3 class="stat-value">{{ stat.value }}</h3>
                <p class="stat-label">{{ stat.label }}</p>
                <span class="stat-detail">{{ stat.detail }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <section class="actions-section">
            <div class="section-header">
              <div>
                <h6 class="sub-title">Accès Rapide</h6>
                <h2 class="section-title">Explorez la boutique</h2>
              </div>
              <ion-button fill="clear" @click="goToCatalog" class="view-all-btn">
                Voir tout
              </ion-button>
            </div>
            
            <div class="chips-container">
              <div class="action-chip primary" @click="goToCatalog">
                <i class="fas fa-bolt"></i> Nouveautés
              </div>
              <div class="action-chip secondary" @click="goToCatalog">
                <i class="fas fa-fire"></i> Meilleures ventes
              </div>
              <div class="action-chip info" @click="goToCatalog">
                <i class="fas fa-tags"></i> Promotions
              </div>
              <div class="action-chip success" @click="goToCatalog">
                <i class="fas fa-leaf"></i> Durable
              </div>
            </div>
          </section>

          <!-- Recommendations -->
          <section class="products-section">
            <div class="section-header">
              <div>
                <h6 class="sub-title">Populaire</h6>
                <h2 class="section-title">Nos recommandations</h2>
              </div>
            </div>
            
            <div class="products-grid">
              <div class="product-card-wrapper" v-for="product in topProducts" :key="product.id" @click="openProduct(product.id)">
                <ion-card class="product-card">
                  <div class="card-img-wrapper">
                    <img :src="product.thumbnail" alt="product thumbnail">
                    <div class="card-overlay">
                      <span class="view-btn">Voir le produit</span>
                    </div>
                  </div>
                  <ion-card-header>
                    <ion-card-title>{{ product.title }}</ion-card-title>
                    <ion-card-subtitle class="product-price">{{ formatPrice(product.price, product.currency) }}</ion-card-subtitle>
                  </ion-card-header>
                </ion-card>
              </div>
            </div>
          </section>

          <!-- Tracking Card (only for customers) -->
          <div class="tracking-card" v-if="!isAdmin">
            <div class="tracking-content">
              <div class="tracking-info">
                <div class="icon-circle">
                  <i class="fas fa-truck-fast"></i>
                </div>
                <div>
                  <h3>Suivi des commandes</h3>
                  <p>Préparez votre prochaine expédition</p>
                </div>
              </div>
              <ion-button color="dark" @click="goToCart">
                Ouvrir le panier
              </ion-button>
            </div>
          </div>

          <div v-if="loading" class="loading-container">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
          </div>
        </div>
        
        <!-- Admin FAB -->
        <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="isAdmin" class="admin-fab">
          <ion-fab-button color="dark" @click="goToAdmin">
            <ion-icon :icon="settingsOutline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>
    </template>
  </MyTemplate>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { settingsOutline, logoWhatsapp } from 'ionicons/icons';
import { IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonSpinner, IonFab, IonFabButton, IonIcon } from '@ionic/vue';

const store = useStore();
const router = useRouter();

const loading = computed(() => store.getters.appIsLoading);
const featuredProduct = computed(() => store.getters.featuredProduct);
const products = computed(() => store.getters.products);
const topProducts = computed(() => products.value.slice(0, 4));
const isAdmin = computed(() => store.getters.user?.is_superadmin === '1');
const highlightStats = [
  { label: 'Nouveaux articles', value: '24', detail: 'Ajoutés cette semaine' },
  { label: 'Commandes actives', value: '64', detail: 'Livraison en cours' },
  { label: 'Satisfaction', value: '4.9/5', detail: 'Indice clients' },
];

const formatPrice = (price: number, currency = 'XOF') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);

const goToCart = () => router.push({ name: 'cart' });
const goToCatalog = () => router.push({ name: 'catalog' });
const openProduct = (productId: number) =>
  router.push({ name: 'product-detail', params: { id: productId } });
const goToAdmin = () => router.push({ name: 'admin-products' });

onMounted(() => {
  if (!products.value.length) {
    store.dispatch('fetchProducts');
  }
});
</script>

<style scoped>
.home-content {
  --background: var(--app-bg);
}

.content-container {
  padding: 16px;
  padding-bottom: 80px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero Section */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, var(--noagab-red) 0%, #B91C1C 100%);
  border-radius: 24px;
  padding: 32px;
  color: white;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: var(--shadow-red);
}

.hero-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.badge-pill {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.1;
}

.hero-desc {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 24px;
  line-height: 1.5;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.price-tag {
  display: flex;
  flex-direction: column;
}

.price-tag .label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.price-tag .price {
  font-size: 1.5rem;
  font-weight: 700;
}

.explore-btn {
  --background: white;
  --color: var(--noagab-red);
  --border-radius: 12px;
  font-weight: 700;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-detail {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Sections */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.sub-title {
  color: var(--noagab-red);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin: 0 0 4px 0;
  letter-spacing: 0.05em;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
}

.view-all-btn {
  --color: var(--text-secondary);
  font-weight: 600;
}

/* Chips */
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
}

.action-chip {
  padding: 10px 20px;
  border-radius: 50px;
  background: white;
  border: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-xs);
}

.action-chip:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.action-chip.primary:hover { color: var(--ion-color-primary); border-color: var(--ion-color-primary); }
.action-chip.secondary:hover { color: var(--ion-color-warning); border-color: var(--ion-color-warning); }
.action-chip.info:hover { color: #0EA5E9; border-color: #0EA5E9; }
.action-chip.success:hover { color: var(--ion-color-success); border-color: var(--ion-color-success); }

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.product-card {
  margin: 0;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.product-card-wrapper:hover .product-card {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-img-wrapper {
  position: relative;
  padding-top: 75%; /* 4:3 Aspect Ratio */
  overflow: hidden;
  background: #f8f8f8;
}

.card-img-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card-wrapper:hover img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card-wrapper:hover .card-overlay {
  opacity: 1;
}

.view-btn {
  background: white;
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.product-card-wrapper:hover .view-btn {
  transform: translateY(0);
}

.product-price {
  color: var(--noagab-red);
  font-weight: 700;
  font-size: 1.1rem;
}

/* Tracking Card */
.tracking-card {
  background: var(--ion-color-tertiary);
  border-radius: 20px;
  padding: 24px;
  color: white;
  margin-bottom: 32px;
  box-shadow: var(--shadow-md);
}

.tracking-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.tracking-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.tracking-info h3 {
  margin: 0 0 4px 0;
  font-size: 1.2rem;
}

.tracking-info p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.admin-fab {
  margin-bottom: 60px; /* Above bottom bar */
}

.whatsapp-fab {
  margin-bottom: 60px; /* Above bottom bar */
  margin-left: 16px;
  z-index: 2000; /* Ensure it's above bottom bar */
}

.whatsapp-fab ion-fab-button {
  --background: #25D366;
  --background-hover: #128C7E;
  --box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
}
</style>
