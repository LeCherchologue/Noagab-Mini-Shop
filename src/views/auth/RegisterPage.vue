<template>
  <ion-page>
    <ion-content class="auth-content" :fullscreen="true">
      <div class="auth-wrapper">
        <!-- Header Section -->
        <div class="auth-header">
          <ion-button fill="clear" class="back-btn" @click="router.push({ name: 'home' })">
            <i class="fas fa-arrow-left"></i>
          </ion-button>
          <div class="header-text">
            <h1>Créer un compte</h1>
            <p>Rejoignez la communauté Noagab</p>
          </div>
          <div class="header-bg"></div>
        </div>

        <!-- Register Form -->
        <div class="auth-form-container">
          <div class="form-card">
            <form @submit.prevent="submit">
              <div class="input-group">
                <label>Nom complet</label>
                <div class="custom-input">
                  <i class="fas fa-user input-icon"></i>
                  <input 
                    type="text" 
                    v-model="form.name"
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

              <div class="input-group">
                <label>Email professionnel</label>
                <div class="custom-input">
                  <i class="fas fa-envelope input-icon"></i>
                  <input 
                    type="email" 
                    v-model="form.email"
                    placeholder="votre@email.com"
                    required
                    autocomplete="email"
                  />
                </div>
              </div>

              <div class="input-group">
                <label>Téléphone</label>
                <div class="custom-input">
                  <i class="fas fa-phone input-icon"></i>
                  <input 
                    type="tel" 
                    v-model="form.telephone1"
                    placeholder="+225 ..."
                  />
                </div>
              </div>

              <div class="input-group">
                <label>Mot de passe</label>
                <div class="custom-input">
                  <i class="fas fa-lock input-icon"></i>
                  <input 
                    type="password" 
                    v-model="form.password"
                    placeholder="••••••••"
                    required
                    autocomplete="new-password"
                  />
                </div>
              </div>

              <ion-button 
                expand="block" 
                type="submit" 
                class="submit-btn"
                :disabled="loading"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>S'inscrire</span>
              </ion-button>

              <div v-if="error" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                {{ error }}
              </div>

              <div class="auth-footer">
                <p>Déjà inscrit ?</p>
                <router-link to="/login" class="register-link">Se connecter</router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { IonPage, IonContent, IonButton, IonSpinner } from '@ionic/vue';

const store = useStore();
const router = useRouter();

const loading = ref(false);
const error = ref('');
const form = reactive({
  name: '',
  email: '',
  password: '',
  telephone1: '',
});

const submit = async () => {
  error.value = '';
  if (!form.name || !form.email || !form.password) {
    error.value = 'Merci de renseigner tous les champs requis.';
    return;
  }
  loading.value = true;
  try {
    await store.dispatch('register', {
      name: form.name,
      email: form.email,
      password: form.password,
      telephone1: form.telephone1,
    });
    router.push({ name: 'home' });
  } catch (err: any) {
    error.value = err?.response?.data?.detail ?? 'Inscription impossible.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-content {
  --background: var(--app-bg);
}

.auth-wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.auth-header {
  position: relative;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  color: white;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--noagab-green) 0%, var(--noagab-red) 100%);
  z-index: -1;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  box-shadow: var(--shadow-lg);
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 10px;
  --color: white;
  font-size: 1.2rem;
}

.header-text h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.header-text p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.auth-form-container {
  flex: 1;
  padding: 0 24px;
  margin-top: -60px;
  margin-bottom: 40px;
}

.form-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--shadow-lg);
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.custom-input {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.custom-input input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid var(--border-color-light);
  border-radius: 12px;
  font-size: 1rem;
  color: var(--text-primary);
  transition: all 0.2s;
  background: var(--app-bg);
}

.custom-input input:focus {
  border-color: var(--noagab-green);
  background: white;
  outline: none;
}

.submit-btn {
  --background: var(--noagab-green);
  --border-radius: 12px;
  --box-shadow: var(--shadow-green);
  font-weight: 700;
  height: 50px;
  margin-bottom: 24px;
}

.error-message {
  background: #FEE2E2;
  color: #DC2626;
  padding: 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.auth-footer {
  text-align: center;
  color: var(--text-secondary);
}

.register-link {
  color: var(--noagab-green);
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}
</style>