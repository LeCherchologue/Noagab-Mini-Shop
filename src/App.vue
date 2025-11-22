<template>
  <div id="app-root">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// No script needed
</script>

<style lang="scss">
@import './style/app.scss';

#app-root {
  min-height: 100vh;
  background-color: var(--app-bg);
}
</style>
