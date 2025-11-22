<template>
    <ion-header class="ion-no-border">
        <ion-toolbar class="custom-toolbar">
            <div class="header-content">
                <div class="left-section">
                    <router-link :to="{name: 'account'}" class="profile-link">
                        <div class="avatar-container">
                            <img :src="userPhoto" alt="Profile">
                        </div>
                    </router-link>
                </div>
                
                <div class="center-section">
                    <router-link :to="{name: 'home'}" class="brand-link">
                        <span class="brand-text">NOAGAB</span>
                    </router-link>
                </div>
                
                <div class="right-section">
                    <router-link :to="{name: 'notifications'}" class="notification-btn">
                        <div class="icon-wrapper">
                            <i class="fa-regular fa-bell"></i>
                            <span class="badge-dot" v-if="notificationCount > 0"></span>
                        </div>
                    </router-link>
                </div>
            </div>
        </ion-toolbar>
    </ion-header>
</template>

<style scoped>
ion-header {
    box-shadow: none;
}

.custom-toolbar {
    --background: rgba(255, 255, 255, 0.85);
    --min-height: 70px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 100%;
    width: 100%;
}

.left-section, .right-section {
    flex: 1;
    display: flex;
    align-items: center;
}

.right-section {
    justify-content: flex-end;
}

.center-section {
    flex: 2;
    display: flex;
    justify-content: center;
}

/* Profile Avatar */
.avatar-container {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--ion-color-primary);
    padding: 2px;
    transition: transform 0.2s ease;
}

.avatar-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.profile-link:active .avatar-container {
    transform: scale(0.95);
}

/* Brand */
.brand-text {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: 1.5rem;
    background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.03em;
}

/* Notifications */
.notification-btn {
    color: var(--text-primary);
    position: relative;
    padding: 8px;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.notification-btn:active {
    background-color: rgba(0,0,0,0.05);
}

.icon-wrapper {
    position: relative;
    font-size: 1.4rem;
}

.badge-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 10px;
    height: 10px;
    background-color: var(--ion-color-primary);
    border-radius: 50%;
    border: 2px solid #fff;
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const defaultAvatar = 'https://ionicframework.com/docs/img/demos/avatar.svg';
const userPhoto = computed(() => store.state.user?.photo ?? defaultAvatar);
const notificationCount = computed(() => store.getters.notificationCount);
</script>
























