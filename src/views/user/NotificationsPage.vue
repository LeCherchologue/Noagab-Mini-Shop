<template>
  <MyTemplate>
    <template #content>
      <ion-content :fullscreen="true" class="notifications-content">
        <div class="notifications-container">
          <div class="page-header">
            <h1>Notifications</h1>
            <ion-button fill="clear" size="small" @click="markAllRead" v-if="notifications.length">
              Tout marquer comme lu
            </ion-button>
          </div>

          <div v-if="loading" class="loading-state">
            <ion-spinner name="crescent"></ion-spinner>
          </div>

          <div v-else-if="notifications.length" class="notifications-list">
            <div 
              class="notification-item" 
              v-for="notif in notifications" 
              :key="notif.id"
              :class="{ unread: !notif.read_at }"
            >
              <div class="icon-box" :class="getIconClass(notif.type)">
                <i :class="getIcon(notif.type)"></i>
              </div>
              <div class="content">
                <p class="message">{{ notif.data.message }}</p>
                <span class="time">{{ formatDate(notif.created_at) }}</span>
              </div>
              <div class="unread-dot" v-if="!notif.read_at"></div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="far fa-bell-slash"></i>
            </div>
            <h3>Aucune notification</h3>
            <p>Vous êtes à jour !</p>
          </div>
        </div>
      </ion-content>
    </template>
  </MyTemplate>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { IonContent, IonButton, IonSpinner } from '@ionic/vue';
import MyTemplate from '../layouts/MyTemplate.vue';
import axios from 'axios';

const store = useStore();
const loading = ref(false);
const notifications = ref<any[]>([]);

const fetchNotifications = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/notifications');
    notifications.value = data;
    // Update store count if needed
    store.commit('setNotifications', data.filter((n: any) => !n.read_at).length);
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    loading.value = false;
  }
};

const markAllRead = async () => {
  try {
    await axios.post('/api/notifications/read-all');
    notifications.value.forEach(n => n.read_at = new Date().toISOString());
    store.commit('setNotifications', 0);
  } catch (error) {
    console.error('Error marking notifications read:', error);
  }
};

const getIcon = (type: string) => {
  switch (type) {
    case 'order': return 'fas fa-box';
    case 'promo': return 'fas fa-tag';
    case 'system': return 'fas fa-info-circle';
    default: return 'fas fa-bell';
  }
};

const getIconClass = (type: string) => {
  switch (type) {
    case 'order': return 'blue';
    case 'promo': return 'green';
    case 'system': return 'gray';
    default: return 'red';
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.notifications-content {
  --background: var(--app-bg);
}

.notifications-container {
  padding: 20px;
  padding-bottom: 100px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  background: white;
  padding: 16px;
  border-radius: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  position: relative;
  transition: all 0.2s;
}

.notification-item.unread {
  background: white;
  border: 1px solid var(--noagab-red);
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-box.blue { background: #EFF6FF; color: #3B82F6; }
.icon-box.green { background: #F0FDF4; color: #16A34A; }
.icon-box.gray { background: #F3F4F6; color: #6B7280; }
.icon-box.red { background: #FEF2F2; color: #DC2626; }

.content {
  flex: 1;
}

.message {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: var(--noagab-red);
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 16px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}
</style>
