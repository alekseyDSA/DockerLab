<template>
  <div style="font-family: Arial;">
    <NavigationMenu />
    <router-view />
  </div>
</template>

<script setup>
import NavigationMenu from './components/ui/NavigationMenu.vue' //меню
// Простейший компонент
</script>

<style>
body { margin: 0; padding: 0; background: #f0f0f0; }
</style>