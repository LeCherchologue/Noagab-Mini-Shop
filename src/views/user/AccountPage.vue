<template>
  <MyTemplate>
    <template #content>
      <ion-content :fullscreen="true" class="account-content">
        <div class="account-container" v-if="user">
          <!-- Profile Header -->
          <div class="profile-header">
            <div class="avatar-wrapper">
              <img :src="user.photo || defaultAvatar" alt="Profile">
              <div class="edit-badge">
                <i class="fas fa-camera"></i>
              </div>
            </div>
            <h1>{{ user.name }}</h1>
            <p class="email">{{ user.email }}</p>
            <span class="role-badge" v-if="isAdmin">Administrateur</span>
          </div>

          <!-- Info Cards -->
          <div class="info-grid">
            <div class="info-card">
              <div class="card-icon">
                <i class="fas fa-phone"></i>
              </div>
              <div class="card-content">
                <span class="label">Téléphone</span>
                <span class="value">{{ user.telephone1 || 'Non renseigné' }}</span>
              </div>
            </div>

            <div class="info-card">
              <div class="card-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div class="card-content">
                <span class="label">Adresse</span>
                <span class="value">{{ user.adresse || 'Non renseignée' }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions-list">
            <button class="action-item" @click="router.push('/orders')">
              <div class="item-left">
                <div class="icon-box blue">
                  <i class="fas fa-box"></i>
                </div>
                <span>Mes commandes</span>
              </div>
              <i class="fas fa-chevron-right"></i>
            </button>

            <button class="action-item" v-if="isAdmin" @click="router.push({ name: 'admin-products' })">
              <div class="item-left">
                <div class="icon-box purple">
                  <i class="fas fa-cog"></i>
                </div>
                <span>Administration</span>
              </div>
              <i class="fas fa-chevron-right"></i>
            </button>

            <button class="action-item logout" @click="logout">
              <div class="item-left">
                <div class="icon-box red">
                  <i class="fas fa-sign-out-alt"></i>
                </div>
                <span>Déconnexion</span>
              </div>
            </button>
          </div>
        </div>

        <div v-else class="login-prompt">
          <div class="prompt-content">
            <i class="fas fa-user-circle"></i>
            <h2>Non connecté</h2>
            <p>Connectez-vous pour accéder à votre profil</p>
            <ion-button expand="block" @click="router.push({ name: 'login' })">
              Se connecter
            </ion-button>
          </div>
        </div>
      </ion-content>
    </template>
  </MyTemplate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { IonContent, IonButton } from '@ionic/vue';
import MyTemplate from '../layouts/MyTemplate.vue';

const store = useStore();
const router = useRouter();

const user = computed(() => store.getters.user);
const isAdmin = computed(() => user.value?.is_superadmin === '1');
const defaultAvatar = 'https://ionicframework.com/docs/img/demos/avatar.svg';

const logout = () => {
  store.commit('clearUserData');
  router.push({ name: 'login' });
};
</script>

<style scoped>
.account-content {
  --background: var(--app-bg);
}

.account-container {
  padding: 20px;
  padding-bottom: 100px;
}

/* Profile Header */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 16px;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: var(--shadow-md);
}

.edit-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--noagab-red);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  border: 2px solid white;
}

.profile-header h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 4px 0;
  color: var(--text-primary);
}

.email {
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.role-badge {
  background: var(--ion-color-light);
  color: var(--text-primary);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.info-card {
  background: white;
  padding: 16px;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: var(--ion-color-light);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--noagab-red);
}

.card-content {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.value {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions List */
.actions-list {
  background: white;
  border-radius: 24px;
  padding: 8px;
  box-shadow: var(--shadow-sm);
}

.action-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--border-color-light);
  cursor: pointer;
  transition: background 0.2s;
}

.action-item:last-child {
  border-bottom: none;
}

.action-item:active {
  background: var(--ion-color-light);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.icon-box.blue { background: #EFF6FF; color: #3B82F6; }
.icon-box.purple { background: #F5F3FF; color: #8B5CF6; }
.icon-box.red { background: #FEF2F2; color: #EF4444; }

.action-item span {
  font-weight: 600;
  color: var(--text-primary);
}

.logout span {
  color: #EF4444;
}

.action-item i.fa-chevron-right {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Login Prompt */
.login-prompt {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.prompt-content {
  text-align: center;
  max-width: 300px;
}

.prompt-content i {
  font-size: 4rem;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.prompt-content h2 {
  font-weight: 800;
  margin-bottom: 8px;
}

.prompt-content p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}
</style>
