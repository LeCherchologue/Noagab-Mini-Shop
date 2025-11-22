<template>
  <ion-page>
    <ion-content class="auth-content" :fullscreen="true">
      <div class="auth-wrapper">
        <!-- Header Section -->
        <div class="auth-header">
         
          <div class="header-text">
            <h1>Bienvenue</h1>
            <p>Connectez-vous à votre espace</p>
          </div>
          <div class="header-bg"></div>
        </div>

        <!-- Login Form -->
        <div class="auth-form-container">
          <div class="form-card">
            <form @submit.prevent="submit">
              <div class="input-group">
                <label>Email</label>
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
                <label>Mot de passe</label>
                <div class="custom-input">
                  <i class="fas fa-lock input-icon"></i>
                  <input 
                    type="password" 
                    v-model="form.password"
                    placeholder="••••••••"
                    required
                    autocomplete="current-password"
                  />
                </div>
              </div>

              <div class="forgot-password">
                <a href="#">Mot de passe oublié ?</a>
              </div>

              <ion-button 
                expand="block" 
                type="submit" 
                class="submit-btn"
                :disabled="loading"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>Se connecter</span>
              </ion-button>

              <div v-if="error" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                {{ error }}
              </div>

              <div class="auth-footer">
                <p>Nouveau client ?</p>
                <router-link to="/register" class="register-link">Créer un compte</router-link>
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
  email: '',
  password: '',
});

const submit = async () => {
  error.value = '';
  if (!form.email || !form.password) {
    error.value = 'Veuillez renseigner vos identifiants.';
    return;
  }

  loading.value = true;
  try {
    await store.dispatch('login', {
      email: form.email,
      password: form.password,
    });
    router.push({ name: 'home' });
  } catch (err: any) {
    error.value = err?.response?.data?.detail ?? 'Connexion impossible.';
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
  background: linear-gradient(135deg, var(--noagab-red) 0%, var(--noagab-green) 100%);
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
  border-color: var(--noagab-red);
  background: white;
  outline: none;
}

.forgot-password {
  text-align: right;
  margin-bottom: 24px;
}

.forgot-password a {
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-decoration: none;
}

.submit-btn {
  --background: var(--noagab-red);
  --border-radius: 12px;
  --box-shadow: var(--shadow-red);
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
  color: var(--noagab-red);
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}
</style>