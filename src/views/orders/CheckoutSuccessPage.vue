<template>
  <ion-page>
    <ion-content class="success-content" :fullscreen="true">
      <div class="success-container">
        <div class="celebration-card">
          <div class="icon-wrapper">
            <div class="pulse-ring"></div>
            <i class="fas fa-check"></i>
          </div>
          
          <h1>Commande Confirmée !</h1>
          <p class="message">
            Merci pour votre confiance. Votre commande a été transmise avec succès à notre équipe.
          </p>

          <div class="info-box">
            <div class="info-item">
              <i class="fas fa-envelope"></i>
              <span>Un email de confirmation a été envoyé</span>
            </div>
            <div class="info-item">
              <i class="fas fa-truck"></i>
              <span>Livraison estimée sous 48h</span>
            </div>
          </div>

          <div class="actions">
            <ion-button expand="block" class="primary-btn" @click="router.push('/catalog')">
              Continuer mes achats
            </ion-button>
            <ion-button expand="block" fill="clear" class="secondary-btn" @click="router.push('/home')">
              Retour à l'accueil
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonButton } from '@ionic/vue';

const router = useRouter();
</script>

<style scoped>
.success-content {
  --background: var(--app-bg);
}

.success-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%);
}

.celebration-card {
  background: white;
  border-radius: 32px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: var(--shadow-xl);
  max-width: 400px;
  width: 100%;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--noagab-green);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32px;
  color: white;
  font-size: 2.5rem;
  position: relative;
  box-shadow: var(--shadow-green);
}

.pulse-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid var(--noagab-green);
  border-radius: 50%;
  opacity: 0.5;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.message {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
}

.info-box {
  background: var(--ion-color-light);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 32px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: left;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item i {
  color: var(--noagab-green);
  font-size: 1.1rem;
}

.primary-btn {
  --background: var(--noagab-red);
  --border-radius: 16px;
  --box-shadow: var(--shadow-red);
  font-weight: 700;
  margin-bottom: 12px;
  height: 50px;
}

.secondary-btn {
  --color: var(--text-secondary);
  font-weight: 600;
}
</style>
