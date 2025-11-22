import 'jquery/dist/jquery'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import "@lottiefiles/lottie-player";

import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import store from './store'
import MyTemplate from './views/layouts/MyTemplate.vue'
import ActionTemplate from './views/layouts/ActionTemplate.vue'
import axios from 'axios';
import VueAxios from 'vue-axios';

// Ionic imports are removed as per refactoring goal, 
// but we keep the package import if needed for specific utilities, 
// though for now we are removing component registration.
import {
  IonicVue,
  IonTitle,
  IonModal,
  IonIcon,
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonList,
  IonItem,
  IonFab,
  IonFabButton,
  IonFabList,
  IonMenu,
  IonMenuButton,
  IonButton,
  IonFooter,
  IonInput
} from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = store.getters.apiUrl;

const currentUser = store.getters.user;
if (currentUser?.token) {
  axios.defaults.headers.common = {
    Authorization: `Bearer ${currentUser.token}`,
  };
}

if (typeof window !== 'undefined') {
  const userSession = localStorage.getItem("yams_user_session");
  if (userSession) {
    const user = JSON.parse(userSession);
    store.commit('setAuthenticated', user);
  }

  const hasSeenDidactitielAt = JSON.parse(localStorage.getItem("yams_client_opened_at") || 'null');
  store.commit('setHasSeenDidactitielAt', hasSeenDidactitielAt);
}

// Add response interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // 401 detected, logout user
      store.commit('clearUserData');
      router.push({ name: 'login' });
    }
    return Promise.reject(error);
  }
);

const app = createApp(App)
  .use(IonicVue) // Keep IonicVue plugin for now to avoid breaking deep deps, but we won't use components
  .use(router)
  .use(store)
  .use(VueAxios, axios);

// Register global layout components
app.component('MyTemplate', MyTemplate);
app.component('ActionTemplate', ActionTemplate);

router.isReady().then(() => {
  app.mount('#app');
});

// Google Sign In
if (typeof window !== 'undefined' && (window as any).GoogleAuth) {
  (window as any).GoogleAuth.initialize({
    clientId: '786884809938-g3qvd3qtulosvghlcu7b3cfsfiu363b1.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
}
