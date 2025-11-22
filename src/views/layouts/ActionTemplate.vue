<template>
  <div class="action-template">
    <div class="container-fluid bg-primary text-white py-2 shadow-sm sticky-top">
      <div class="d-flex align-items-center">
        <button type="button" class="btn btn-link text-white p-0 mr-3" @click="goBack">
          <i class="fas fa-arrow-left fa-lg"></i>
        </button>
        <div class="flex-grow-1">
          <slot name="page_title"></slot>
        </div>
      </div>
    </div>
    <div class="container pt-3">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.action-template {
  min-height: 100vh;
  background: var(--app-bg);
}
</style>
