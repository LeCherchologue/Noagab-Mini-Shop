<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="admin-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="router.push({ name: 'home' })" color="dark">
            <i class="fas fa-arrow-left"></i>
          </ion-button>
        </ion-buttons>
        <ion-title>Espace Admin</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openCreateModal" class="create-btn">
            <i class="fas fa-plus"></i>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      
      <!-- Tab Navigation -->
      <ion-toolbar class="tabs-toolbar">
        <div class="tabs-container">
          <button 
            class="tab-btn active"
          >
            <i class="fas fa-box"></i>
            Produits
          </button>
          <button 
            class="tab-btn"
            @click="router.push({ name: 'admin-users' })"
          >
            <i class="fas fa-users"></i>
            Utilisateurs
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="admin-content" :fullscreen="true">
      <div class="admin-container">
        <!-- Hero Stats -->
        <div class="stats-hero">
          <div class="hero-content">
            <span class="hero-label">Vue d'ensemble</span>
            <h1>Gestion Catalogue</h1>
            <p>Gérez vos produits et suivez les stocks en temps réel.</p>
          </div>
          <div class="hero-bg"></div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card" v-for="metric in metrics" :key="metric.label">
            <div class="metric-icon">
              <i :class="metric.icon"></i>
            </div>
            <div class="metric-info">
              <span class="metric-label">{{ metric.label }}</span>
              <span class="metric-value">{{ metric.value }}</span>
              <span class="metric-detail">{{ metric.detail }}</span>
            </div>
          </div>
        </div>

        <!-- Product List -->
        <div class="products-section">
          <div class="section-header">
            <h3>Catalogue</h3>
            <span class="badge">{{ products.length }} références</span>
          </div>

          <div v-if="loading" class="loading-state">
            <ion-spinner name="crescent"></ion-spinner>
          </div>

          <div v-else-if="products.length" class="products-list">
            <div class="product-item" v-for="product in products" :key="product.id">
              <div class="product-thumb">
                <img :src="product.thumbnail" :alt="product.title">
              </div>
              <div class="product-info">
                <div class="info-header">
                  <h4>{{ product.title }}</h4>
                  <span class="category-badge">{{ product.category || 'N/A' }}</span>
                </div>
                <div class="info-meta">
                  <span class="price">{{ formatPrice(product.price, product.currency) }}</span>
                  <span class="stock" :class="{ 'low-stock': product.stock < 5 }">
                    Stock: {{ product.stock }}
                  </span>
                </div>
              </div>
              <div class="product-actions">
                <ion-button fill="clear" size="small" @click="openEditModal(product)">
                  <i class="fas fa-edit"></i>
                </ion-button>
                <ion-button fill="clear" color="danger" size="small" @click="confirmDelete(product)">
                  <i class="fas fa-trash-alt"></i>
                </ion-button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-box-open"></i>
            <p>Aucun produit dans le catalogue</p>
          </div>
        </div>
      </div>

      <!-- Edit/Create Modal -->
      <ion-modal :is-open="modalOpen" @didDismiss="closeModal" class="custom-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingProduct ? 'Modifier' : 'Nouveau Produit' }}</h3>
            <ion-button fill="clear" @click="closeModal">
              <i class="fas fa-times"></i>
            </ion-button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="persistProduct">
              <div class="form-group">
                <label>Nom</label>
                <input v-model="form.title" type="text" class="custom-input" required>
              </div>
              
              <div class="form-row">
                <div class="form-group half">
                  <label>Prix</label>
                  <input v-model.number="form.price" type="number" class="custom-input" required>
                </div>
                <div class="form-group half">
                  <label>Catégorie</label>
                  <input v-model="form.category" type="text" class="custom-input" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label>Statut</label>
                  <select v-model="form.status" class="custom-input" required>
                    <option value="disponible">Disponible</option>
                    <option value="rupture">Rupture</option>
                  </select>
                </div>
                <div class="form-group half">
                  <label>Quantité</label>
                  <input v-model.number="form.stock" type="number" class="custom-input" required>
                </div>
              </div>

              <div class="form-group">
                <label>Image</label>
                <input type="file" @change="handleImageUpload" accept="image/*" class="custom-input file-input">
                <div v-if="imagePreview" class="image-preview">
                  <img :src="imagePreview" alt="Preview">
                </div>
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea v-model="form.description" class="custom-input" rows="3" required></textarea>
              </div>

              <ion-button expand="block" type="submit" class="submit-btn" :disabled="loading">
                {{ editingProduct ? 'Mettre à jour' : 'Créer' }}
              </ion-button>
            </form>
          </div>
        </div>
      </ion-modal>

      <!-- Delete Alert -->
      <ion-alert
        :is-open="deleteAlertOpen"
        header="Supprimer ce produit ?"
        message="Cette action est irréversible."
        :buttons="alertButtons"
        @didDismiss="deleteAlertOpen = false"
      ></ion-alert>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonSpinner, IonModal, IonAlert } from '@ionic/vue';
import type { Product } from '../../store';

const store = useStore();
const router = useRouter();

const products = computed<Product[]>(() => store.getters.products);
const loading = computed(() => store.getters.appIsLoading);
const isAdmin = computed(() => store.getters.user?.is_superadmin === '1');

const metrics = computed(() => [
  { label: 'Produits actifs', value: products.value.length, detail: 'En ligne', icon: 'fas fa-box' },
  { label: 'Nouveautés', value: '8', detail: '7 derniers jours', icon: 'fas fa-star' },
  { label: 'Stock critique', value: products.value.filter((p) => p.stock < 5).length, detail: '< 5 unités', icon: 'fas fa-exclamation-triangle' },
]);

const modalOpen = ref(false);
const deleteAlertOpen = ref(false);
const editingProduct = ref<Product | null>(null);
const productToDelete = ref<Product | null>(null);
const imagePreview = ref<string>('');
const selectedImageFile = ref<File | null>(null);

const form = reactive({
  title: '',
  price: 0,
  stock: 0,
  thumbnail: '',
  category: '',
  description: '',
  status: 'disponible',
});

const defaultThumbnail = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

const formatPrice = (price: number, currency = 'XOF') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    selectedImageFile.value = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Store filename in form for now (will be replaced with uploaded URL)
    form.thumbnail = file.name;
  }
};

const resetForm = () => {
  form.title = '';
  form.price = 0;
  form.stock = 0;
  form.thumbnail = defaultThumbnail;
  form.category = '';
  form.description = '';
  form.status = 'disponible';
  imagePreview.value = '';
  selectedImageFile.value = null;
};

const openCreateModal = () => {
  editingProduct.value = null;
  resetForm();
  modalOpen.value = true;
};

const openEditModal = (product: Product) => {
  editingProduct.value = product;
  form.title = product.title;
  form.price = product.price;
  form.stock = product.stock;
  form.thumbnail = product.thumbnail;
  form.category = product.category || '';
  form.description = product.description;
  form.status = product.disponibilite || 'disponible';
  imagePreview.value = product.thumbnail; // Show existing image
  selectedImageFile.value = null;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const persistProduct = async () => {
  const payload = {
    title: form.title,
    price: form.price,
    stock: form.stock,
    thumbnail: form.thumbnail || defaultThumbnail,
    category: form.category,
    description: form.description,
    disponibilite: form.status,
    currency: 'XOF',
    imageFile: selectedImageFile.value || undefined,
  };
  
  if (editingProduct.value) {
    await store.dispatch('updateProduct', { ...payload, id: editingProduct.value.id });
  } else {
    await store.dispatch('createProduct', payload);
  }
  
  // Refresh product list to ensure UI is up to date
  await store.dispatch('fetchProducts');
  
  modalOpen.value = false;
};

const confirmDelete = (product: Product) => {
  productToDelete.value = product;
  deleteAlertOpen.value = true;
};

const executeDelete = async () => {
  if (productToDelete.value) {
    await store.dispatch('deleteProduct', productToDelete.value.id);
    // Refresh product list to ensure UI is up to date
    await store.dispatch('fetchProducts');
  }
  productToDelete.value = null;
};

const alertButtons = [
  {
    text: 'Annuler',
    role: 'cancel',
  },
  {
    text: 'Supprimer',
    role: 'confirm',
    handler: executeDelete,
    cssClass: 'alert-danger',
  },
];

if (!isAdmin.value) {
  router.push({ name: 'home' });
} else if (!products.value.length) {
  store.dispatch('fetchProducts');
}
</script>

<style scoped>
.admin-content {
  --background: var(--app-bg);
}

.admin-toolbar {
  --background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color-light);
}

.tabs-toolbar {
  --background: white;
  --border-width: 0;
}

.tabs-container {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn:hover {
  background: var(--ion-color-light);
}

.tab-btn.active {
  background: var(--noagab-red);
  color: white;
}

.create-btn {
  --color: var(--noagab-green);
  font-weight: 700;
}

.admin-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Hero Stats */
.stats-hero {
  position: relative;
  background: linear-gradient(135deg, var(--noagab-red) 0%, var(--noagab-green) 100%);
  border-radius: 24px;
  padding: 32px;
  color: white;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-label {
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  opacity: 0.8;
  font-weight: 600;
}

.stats-hero h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 8px 0;
}

.stats-hero p {
  opacity: 0.9;
  margin: 0;
  max-width: 400px;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  background: var(--ion-color-light);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--noagab-red);
  font-size: 1.2rem;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
}

.metric-detail {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Products List */
.products-section {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  font-weight: 800;
  margin: 0;
}

.badge {
  background: var(--ion-color-light);
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border-color-light);
  border-radius: 16px;
  transition: all 0.2s;
}

.product-item:hover {
  border-color: var(--noagab-red);
  box-shadow: var(--shadow-xs);
}

.product-thumb {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.info-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.category-badge {
  font-size: 0.7rem;
  background: var(--ion-color-light);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--text-secondary);
}

.info-meta {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
}

.price {
  font-weight: 600;
  color: var(--text-primary);
}

.stock {
  color: var(--text-secondary);
}

.stock.low-stock {
  color: #DC2626;
  font-weight: 600;
}

.product-actions {
  display: flex;
  gap: 4px;
}

/* Modal Styles */
.custom-modal {
  --width: 95%;
  --max-width: 600px;
  --height: auto;
  --max-height: 95%;
  --border-radius: 24px;
}

.modal-content {
  background: white;
  padding: 24px;
  max-height: 95vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  font-weight: 800;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.custom-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color-light);
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.custom-input:focus {
  border-color: var(--noagab-green);
  outline: none;
}

.file-input {
  padding: 8px 12px;
  cursor: pointer;
}

.file-input::-webkit-file-upload-button {
  padding: 8px 16px;
  background: var(--noagab-green);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-right: 12px;
}

.file-input::-webkit-file-upload-button:hover {
  opacity: 0.9;
}

.image-preview {
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  max-width: 300px;
  border: 2px solid var(--border-color-light);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.form-row {
  display: flex;
  gap: 16px;
}

.half {
  flex: 1;
}

.submit-btn {
  --background: var(--noagab-green);
  --border-radius: 12px;
  font-weight: 700;
  margin-top: 24px;
}
</style>
