<template>
  <div class="my-template">
    <NavBar />
    <main class="content-wrapper">
      <slot name="content"></slot>
    </main>
    <BottomBar />
  </div>
</template>

<script setup lang="ts">
import NavBar from './NavBar.vue';
import BottomBar from './BottomBar.vue';
</script>

<style scoped>
.my-template {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
  padding-bottom: 60px; /* Space for BottomBar */
}
</style>
