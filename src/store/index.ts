import { createStore } from 'vuex';
import axios from 'axios';

export interface User {
  verifiedAccount: boolean;
  id: number;
  name: string;
  telephone1: string;
  telephone2: string;
  bp: string;
  email: string;
  date_naissance: string;
  sexe: string;
  adresse: string;
  photo: string;
  sigle: string;
  is_superadmin: string;
  token: string;
}

// API User structure from backend
interface ApiUser {
  id?: number;
  nom: string;
  prenom: string;
  tel: string;
  adresse: string;
  email: string;
  profil: string;
}

interface ApiLoginResponse {
  detail: string;
  user: ApiUser;
  token?: string;
}

// Transform API user to app User format
const transformApiUser = (apiUser: ApiUser, token?: string): User => {
  return {
    id: apiUser.id || 0,
    name: `${apiUser.prenom} ${apiUser.nom}`,
    telephone1: apiUser.tel,
    telephone2: '',
    bp: '',
    email: apiUser.email,
    date_naissance: '',
    sexe: '',
    adresse: apiUser.adresse,
    photo: '',
    sigle: '',
    is_superadmin: apiUser.profil === 'admin' ? '1' : '0',
    token: token || '',
    verifiedAccount: true,
  };
};

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  thumbnail: string;
  stock: number;
  category?: string;
  disponibilite?: string; // 'disponible', 'rupture', 'precommande', etc.
  rating?: number;
}

// API Product structure from backend
interface ApiProduct {
  id?: number;
  nom: string;
  prix: string;
  categorie: string;
  description: string;
  statut: string;
  quantite: string;
  images: string;
}

// Simple hash function to generate numeric ID from string
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Transform API product to app Product format
const transformApiProduct = (apiProduct: ApiProduct, index?: number): Product => {
  const baseUrl = 'http://127.0.0.1:8000/';
  // Generate unique ID from product name if not provided by API
  const productId = apiProduct.id || hashString(apiProduct.nom + apiProduct.prix);

  return {
    id: productId,
    title: apiProduct.nom,
    description: apiProduct.description,
    price: parseFloat(apiProduct.prix) || 0,
    currency: 'XOF',
    thumbnail: apiProduct.images.startsWith('http')
      ? apiProduct.images
      : `${baseUrl}${apiProduct.images}`,
    stock: parseInt(apiProduct.quantite) || 0,
    category: apiProduct.categorie,
    disponibilite: apiProduct.statut, // Map statut to disponibilite
    rating: 0,
  };
};

// Transform app Product to API format
const transformToApiProduct = (product: Partial<Product>): Partial<ApiProduct> => {
  return {
    nom: product.title || '',
    prix: product.price?.toString() || '0',
    categorie: product.category || '',
    description: product.description || '',
    statut: 'actif',
    quantite: product.stock?.toString() || '0',
    images: product.thumbnail || '',
  };
};

export interface CartItem {
  product: Product;
  quantity: number;
}

type CheckoutStatus = 'idle' | 'success' | 'error';

interface CredentialsPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  telephone1?: string;
}

type ProductPayload = Omit<Product, 'id'> & Partial<Pick<Product, 'id'>> & {
  imageFile?: File;
};

interface UserPayload {
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  adresse: string;
  profil: 'admin' | 'client';
  password?: string;
}

interface State {
  appIsLoading: boolean;
  authenticated: boolean;
  hasSeenDidactitielAt: string;
  app_url: string;
  api_url: string;
  notificationCount: number;
  user: User | null;
  fetchInterval: number | null;
  products: Product[];
  selectedProduct: Product | null;
  cart: CartItem[];
  checkoutStatus: CheckoutStatus;
  users: User[];
}

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const cached = window.localStorage.getItem('yams_cart');
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.warn('Impossible de charger le panier local:', error);
    return [];
  }
};

const persistCart = (cart: CartItem[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('yams_cart', JSON.stringify(cart));
};

export default createStore({
  state: {
    appIsLoading: false,
    authenticated: false,
    hasSeenDidactitielAt: '',
    notificationCount: 0,
    api_url: 'http://127.0.0.1:8000',
    app_url: 'http://localhost:8100',
    user: null,
    fetchInterval: null,
    products: [],
    selectedProduct: null,
    cart: loadCartFromStorage(),
    checkoutStatus: 'idle',
    users: [],
  } as State,

  getters: {
    fetchInterval: (state: State) => state.fetchInterval,
    appIsLoading: (state: State) => state.appIsLoading,
    notificationCount: (state: State) => state.notificationCount,
    authenticated: (state: State) => state.authenticated,
    user: (state: State) => state.user,
    apiUrl: (state: State) => state.api_url,
    appUrl: (state: State) => state.app_url,
    hasSeenDidactitielAt: (state: State) => state.hasSeenDidactitielAt,
    isAdmin: (state: State) => state.user?.is_superadmin === '1',
    isCustomer: (state: State) => state.authenticated && state.user?.is_superadmin !== '1',
    products: (state: State) => state.products,
    featuredProduct: (state: State) => state.products[0] || null,
    selectedProduct: (state: State) => state.selectedProduct,
    cartItems: (state: State) => state.cart,
    cartCount: (state: State) =>
      state.cart.reduce((total, item) => total + item.quantity, 0),
    cartTotal: (state: State) =>
      state.cart.reduce(
        (total, item) => total + item.quantity * item.product.price,
        0
      ),
    checkoutStatus: (state: State) => state.checkoutStatus,
    users: (state: State) => state.users,
    userCount: (state: State) => state.users.length,
  },

  mutations: {
    setAppLoading(state: State, isLoading: boolean) {
      state.appIsLoading = isLoading;
    },
    setNotifications(state: State, nb: number) {
      state.notificationCount = nb;
    },
    setAuthenticated(state: State, value: User) {
      state.appIsLoading = true;
      state.authenticated = true;
      state.user = value;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'yams_user_session',
          JSON.stringify(state.user)
        );
      }
      axios.defaults.headers.common.Authorization = `Bearer ${value.token}`;
      state.appIsLoading = false;
    },
    setHasSeenDidactitielAt(state: State, value: string) {
      state.appIsLoading = true;
      state.hasSeenDidactitielAt = value;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'yams_client_opened_at',
          JSON.stringify(value)
        );
      }
      state.appIsLoading = false;
    },
    clearUserData(state: State) {
      state.appIsLoading = true;
      state.authenticated = false;
      state.user = null;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('yams_user_session');
      }
      delete axios.defaults.headers.common.Authorization;
      state.appIsLoading = false;
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },
    setUserProfileDatas(state: State, value: User) {
      state.appIsLoading = true;
      state.user = value;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'yams_user_session',
          JSON.stringify(state.user)
        );
      }
      state.appIsLoading = false;
    },
    setFetchInterval(state: State, interval: number) {
      state.fetchInterval = interval;
    },
    clearFetchInterval(state: State) {
      state.fetchInterval = null;
    },
    setProducts(state: State, products: Product[]) {
      state.products = products;
      if (!state.selectedProduct && products.length) {
        state.selectedProduct = products[0];
      }
    },
    setSelectedProduct(state: State, product: Product | null) {
      state.selectedProduct = product;
    },
    upsertProduct(state: State, product: Product) {
      const idx = state.products.findIndex((item) => item.id === product.id);
      if (idx > -1) {
        state.products[idx] = product;
      } else {
        state.products.unshift(product);
      }

      if (state.selectedProduct?.id === product.id) {
        state.selectedProduct = product;
      }
    },
    removeProduct(state: State, productId: number) {
      state.products = state.products.filter((product) => product.id !== productId);
      if (state.selectedProduct?.id === productId) {
        state.selectedProduct = null;
      }
    },
    addToCart(
      state: State,
      payload: { product: Product; quantity?: number }
    ) {
      const quantity = payload.quantity ?? 1;
      const existingIndex = state.cart.findIndex(
        (item) => item.product.id === payload.product.id
      );

      if (existingIndex > -1) {
        state.cart[existingIndex].quantity += quantity;
      } else {
        state.cart.push({
          product: payload.product,
          quantity,
        });
      }

      persistCart(state.cart);
    },
    updateCartItemQuantity(
      state: State,
      payload: { productId: number; quantity: number }
    ) {
      const item = state.cart.find(
        (cartItem) => cartItem.product.id === payload.productId
      );

      if (item) {
        item.quantity = payload.quantity;
        if (item.quantity <= 0) {
          state.cart = state.cart.filter(
            (cartItem) => cartItem.product.id !== payload.productId
          );
        }
      }

      persistCart(state.cart);
    },
    removeCartItem(state: State, productId: number) {
      state.cart = state.cart.filter(
        (cartItem) => cartItem.product.id !== productId
      );
      persistCart(state.cart);
    },
    clearCart(state: State) {
      state.cart = [];
      persistCart(state.cart);
    },
    setCheckoutStatus(state: State, status: CheckoutStatus) {
      state.checkoutStatus = status;
    },
    setUsers(state: State, users: User[]) {
      state.users = users;
    },
    upsertUser(state: State, user: User) {
      const idx = state.users.findIndex((u) => u.id === user.id);
      if (idx > -1) {
        state.users[idx] = user;
      } else {
        state.users.push(user);
      }
    },
    removeUser(state: State, userId: number) {
      state.users = state.users.filter((u) => u.id !== userId);
    },
  },

  actions: {
    async fetchNotifications({ commit }) {
      try {
        const response = await axios.get(
          '/api/notifications?read_at=null&req_count'
        );
        commit('setNotifications', response.data);
      } catch (error) {
        console.error(
          'Erreur lors de la recupération des notifications:',
          error
        );
      }
    },
    async fetchProducts({ commit }, params: Record<string, unknown> = {}) {
      commit('setAppLoading', true);
      try {
        const { data } = await axios.get<ApiProduct[]>('/api/produits', { params });
        const products = data.map(transformApiProduct);
        commit('setProducts', products);
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      } finally {
        commit('setAppLoading', false);
      }
    },
    async fetchProductById({ commit, state, dispatch }, productId: number) {
      commit('setAppLoading', true);
      try {
        // First, try to find the product in the existing products list
        let product = state.products.find(p => p.id === productId);

        // If not found, try to fetch from API using POST method
        if (!product) {
          try {
            const { data } = await axios.post<ApiProduct>(`/api/produits/${productId}`);
            product = transformApiProduct(data);
            // Add to products list if not already there
            if (product && !state.products.find(p => p.id === product!.id)) {
              commit('upsertProduct', product);
            }
          } catch (apiError) {
            console.warn('Unable to fetch product from API:', apiError);
            // If API fails and products list is empty, fetch all products
            if (state.products.length === 0) {
              await dispatch('fetchProducts');
              product = state.products.find(p => p.id === productId);
            }
          }
        }

        commit('setSelectedProduct', product || null);
      } catch (error) {
        console.error('Impossible de récupérer le produit:', error);
        commit('setSelectedProduct', null);
      } finally {
        commit('setAppLoading', false);
      }
    },
    addProductToCart({ commit }, payload: { product: Product; quantity?: number }) {
      commit('addToCart', payload);
    },
    updateCartQuantity(
      { commit },
      payload: { productId: number; quantity: number }
    ) {
      commit('updateCartItemQuantity', payload);
    },
    removeItemFromCart({ commit }, productId: number) {
      commit('removeCartItem', productId);
    },
    async createProduct({ commit }, payload: ProductPayload) {
      commit('setAppLoading', true);
      try {
        // API expects multipart/form-data with PUT method
        const formData = new FormData();
        formData.append('nom', payload.title || '');
        formData.append('prix', payload.price?.toString() || '0');
        formData.append('categorie', payload.category || '');
        formData.append('description', payload.description || '');
        formData.append('statut', payload.disponibilite || 'disponible');
        formData.append('quantite', payload.stock?.toString() || '0');

        // Add image file if provided
        if (payload.imageFile) {
          formData.append('images', payload.imageFile);
        }

        const { data } = await axios.post<ApiProduct>('/api/produits', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const product = transformApiProduct(data);
        commit('upsertProduct', product);
        return product;
      } finally {
        commit('setAppLoading', false);
      }
    },
    async updateProduct({ commit }, payload: ProductPayload & { id: number }) {
      commit('setAppLoading', true);
      try {
        const apiPayload = transformToApiProduct(payload);
        const { data } = await axios.put<ApiProduct>(`/api/produits/${payload.id}`, apiPayload);
        const product = transformApiProduct(data);
        commit('upsertProduct', product);
        return product;
      } finally {
        commit('setAppLoading', false);
      }
    },
    async deleteProduct({ commit }, productId: number) {
      commit('setAppLoading', true);
      try {
        await axios.delete(`/api/produits/${productId}`);
        commit('removeProduct', productId);
      } finally {
        commit('setAppLoading', false);
      }
    },
    async checkoutCart({ commit, state }) {
      commit('setAppLoading', true);
      commit('setCheckoutStatus', 'idle');
      try {
        if (!state.user || !state.user.id) {
          throw new Error('User ID not found');
        }

        const orderPromises = state.cart.map((item) => {
          const payload = {
            quantite: item.quantity,
            total: item.product.price * item.quantity,
            produit_id: item.product.id,
            user_id: state.user!.id,
          };
          console.log('Sending order payload:', payload);
          return axios.post('/api/commandes', payload);
        });

        await Promise.all(orderPromises);

        commit('setCheckoutStatus', 'success');
        commit('clearCart');
      } catch (error: any) {
        commit('setCheckoutStatus', 'error');
        console.error('Erreur lors du checkout:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
        throw error;
      } finally {
        commit('setAppLoading', false);
      }
    },
    async login({ commit }, credentials: CredentialsPayload) {
      commit('setAppLoading', true);
      try {
        const { data } = await axios.post<ApiLoginResponse>('/api/login', credentials);
        console.log('Login API response:', data);
        // Transform API user to app User format
        const user = transformApiUser(data.user, data.token);
        commit('setAuthenticated', user);
        commit('setAppLoading', false);
        return { ...data, user };
      } catch (error) {
        commit('setAppLoading', false);
        throw error;
      }
    },
    async register({ commit }, payload: RegisterPayload) {
      commit('setAppLoading', true);
      try {
        const { data } = await axios.post('/auth/register', payload);
        if (data.user) {
          commit('setAuthenticated', data.user);
        }
        return data;
      } finally {
        commit('setAppLoading', false);
      }
    },
    async fetchUsers({ commit }) {
      commit('setAppLoading', true);
      try {
        const { data } = await axios.get<ApiUser[]>('/api/users');
        const users = data.map((apiUser, index) => transformApiUser(apiUser));
        commit('setUsers', users);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      } finally {
        commit('setAppLoading', false);
      }
    },
    async createUser({ commit }, payload: UserPayload) {
      commit('setAppLoading', true);
      try {
        const { data } = await axios.post<ApiUser>('/api/users', payload);
        const user = transformApiUser(data);
        commit('upsertUser', user);
        return user;
      } finally {
        commit('setAppLoading', false);
      }
    },
    async updateUser({ commit }, payload: UserPayload & { id: number }) {
      commit('setAppLoading', true);
      try {
        // Ensure ID is included in the payload
        const updatePayload = {
          ...payload,
          id: payload.id,
        };
        const { data } = await axios.put<ApiUser>(`/api/users/${payload.id}`, updatePayload);
        const user = transformApiUser(data);
        commit('upsertUser', user);
        return user;
      } finally {
        commit('setAppLoading', false);
      }
    },
    async deleteUser({ commit }, userId: number) {
      commit('setAppLoading', true);
      try {
        await axios.delete(`/api/users/${userId}`);
        commit('removeUser', userId);
      } finally {
        commit('setAppLoading', false);
      }
    },
  },
  modules: {},
});