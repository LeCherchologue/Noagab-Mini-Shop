<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="admin-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="router.push({ name: 'home' })" color="dark">
            <i class="fas fa-arrow-left"></i>
          </ion-button>
        </ion-buttons>
        <ion-title>Gestion Utilisateurs</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openCreateModal" class="create-btn">
            <i class="fas fa-user-plus"></i>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      
      <!-- Tab Navigation -->
      <ion-toolbar class="tabs-toolbar">
        <div class="tabs-container">
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'products' }"
            @click="router.push({ name: 'admin-products' })"
          >
            <i class="fas fa-box"></i>
            Produits
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'users' }"
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
            <h1>Gestion Utilisateurs</h1>
            <p>Gérez les comptes utilisateurs et leurs permissions.</p>
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

        <!-- Users List -->
        <div class="users-section">
          <div class="section-header">
            <h3>Utilisateurs</h3>
            <span class="badge">{{ users.length }} comptes</span>
          </div>

          <div v-if="loading" class="loading-state">
            <ion-spinner name="crescent"></ion-spinner>
          </div>

          <div v-else-if="users.length" class="users-list">
            <div class="user-item" v-for="user in users" :key="user.id">
              <div class="user-avatar">
                <img :src="user.photo || defaultAvatar" :alt="user.name">
              </div>
              <div class="user-info">
                <div class="info-header">
                  <h4>{{ user.name }}</h4>
                  <span class="role-badge" :class="{ admin: user.is_superadmin === '1' }">
                    {{ user.is_superadmin === '1' ? 'Admin' : 'Client' }}
                  </span>
                </div>
                <div class="info-meta">
                  <span class="email"><i class="fas fa-envelope"></i> {{ user.email }}</span>
                  <span class="phone" v-if="user.telephone1">
                    <i class="fas fa-phone"></i> {{ user.telephone1 }}
                  </span>
                </div>
                <div class="user-actions">
                  <ion-button fill="clear" size="small" @click="openEditModal(user)">
                    <i class="fas fa-edit"></i>
                  </ion-button>
                  <ion-button fill="clear" color="danger" size="small" @click="confirmDelete(user)">
                    <i class="fas fa-trash-alt"></i>
                  </ion-button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-users"></i>
            <p>Aucun utilisateur</p>
          </div>
        </div>
      </div>

      <!-- Edit/Create Modal -->
      <ion-modal :is-open="modalOpen" @didDismiss="closeModal" class="custom-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur' }}</h3>
            <ion-button fill="clear" @click="closeModal">
              <i class="fas fa-times"></i>
            </ion-button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="persistUser">
              <div class="form-row">
                <div class="form-group half">
                  <label>Prénom</label>
                  <input v-model="form.prenom" type="text" class="custom-input" required>
                </div>
                <div class="form-group half">
                  <label>Nom</label>
                  <input v-model="form.nom" type="text" class="custom-input" required>
                </div>
              </div>
              
              <div class="form-group">
                <label>Email</label>
                <input v-model="form.email" type="email" class="custom-input" required>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label>Téléphone</label>
                  <input v-model="form.tel" type="tel" class="custom-input">
                </div>
                <div class="form-group half">
                  <label>Profil</label>
                  <input v-model="form.profil" type="text" class="custom-input" disabled readonly>
                </div>
              </div>

              <div class="form-group">
                <label>Adresse</label>
                <input v-model="form.adresse" type="text" class="custom-input">
              </div>

              <div class="form-group" v-if="!editingUser">
                <label>Mot de passe</label>
                <input v-model="form.password" type="password" class="custom-input" :required="!editingUser">
              </div>

              <ion-button expand="block" type="submit" class="submit-btn" :disabled="loading">
                {{ editingUser ? 'Mettre à jour' : 'Créer' }}
              </ion-button>
            </form>
          </div>
        </div>
      </ion-modal>

      <!-- Delete Alert -->
      <ion-alert
        :is-open="deleteAlertOpen"
        header="Supprimer cet utilisateur ?"
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
import type { User } from '../../store';

const store = useStore();
const router = useRouter();

const currentTab = ref('users');
const users = computed<User[]>(() => store.getters.users);
const loading = computed(() => store.getters.appIsLoading);
const isAdmin = computed(() => store.getters.user?.is_superadmin === '1');

const defaultAvatar = 'https://ionicframework.com/docs/img/demos/avatar.svg';

const metrics = computed(() => [
  { label: 'Total utilisateurs', value: users.value.length, detail: 'Actifs', icon: 'fas fa-users' },
  { label: 'Administrateurs', value: users.value.filter((u) => u.is_superadmin === '1').length, detail: 'Avec permissions', icon: 'fas fa-user-shield' },
  { label: 'Clients', value: users.value.filter((u) => u.is_superadmin !== '1').length, detail: 'Comptes standards', icon: 'fas fa-user' },
]);

const modalOpen = ref(false);
const deleteAlertOpen = ref(false);
const editingUser = ref<User | null>(null);
const userToDelete = ref<User | null>(null);

const form = reactive({
  nom: '',
  prenom: '',
  email: '',
  tel: '',
  adresse: '',
  profil: 'client' as 'admin' | 'client',
  password: '',
});

const resetForm = () => {
  form.nom = '';
  form.prenom = '';
  form.email = '';
  form.tel = '';
  form.adresse = '';
  form.profil = 'client';
  form.password = '';
};

const openCreateModal = () => {
  editingUser.value = null;
  resetForm();
  modalOpen.value = true;
};

const openEditModal = (user: User) => {
  editingUser.value = user;
  // Map User to form format
  const [prenom, ...nomParts] = user.name.split(' ');
  form.prenom = prenom || '';
  form.nom = nomParts.join(' ') || '';
  form.email = user.email;
  form.tel = user.telephone1;
  form.adresse = user.adresse;
  form.profil = user.is_superadmin === '1' ? 'admin' : 'client';
  form.password = '';
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const persistUser = async () => {
  const payload = { ...form };
  if (editingUser.value) {
    await store.dispatch('updateUser', { ...payload, id: editingUser.value.id });
  } else {
    await store.dispatch('createUser', payload);
  }
  
  // Refresh user list to ensure UI is up to date
  await store.dispatch('fetchUsers');
  
  modalOpen.value = false;
};

const confirmDelete = (user: User) => {
  userToDelete.value = user;
  deleteAlertOpen.value = true;
};

const executeDelete = async () => {
  if (userToDelete.value) {
    await store.dispatch('deleteUser', userToDelete.value.id);
    // Refresh user list to ensure UI is up to date
    await store.dispatch('fetchUsers');
  }
  userToDelete.value = null;
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
} else if (!users.value.length) {
  store.dispatch('fetchUsers');
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
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
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
  color: #3B82F6;
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

/* Users List */
.users-section {
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

.users-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border-color-light);
  border-radius: 16px;
  transition: all 0.2s;
}

.user-item:hover {
  border-color: #3B82F6;
  box-shadow: var(--shadow-xs);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
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

.role-badge {
  font-size: 0.7rem;
  background: var(--ion-color-light);
  padding: 3px 10px;
  border-radius: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.role-badge.admin {
  background: #FEE2E2;
  color: #DC2626;
}

.info-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.info-meta i {
  margin-right: 4px;
  font-size: 0.75rem;
}

.user-actions {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color-light);
}

.user-actions ion-button {
  --padding-start: 0;
  --padding-end: 0;
  --border-radius: 8px;
  width: 32px;
  height: 32px;
  margin: 0;
}

.user-actions ion-button i {
  font-size: 0.9rem;
}

.user-actions ion-button:first-child {
  --background: #3B82F6;
  --color: white;
  --background-hover: #2563EB;
}

.user-actions ion-button:last-child {
  --background: #DC2626;
  --color: white;
  --background-hover: #B91C1C;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.3;
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
  border-color: #3B82F6;
  outline: none;
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
