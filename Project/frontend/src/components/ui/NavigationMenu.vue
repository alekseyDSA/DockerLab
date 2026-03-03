<template>
  <div class="navigation-menu">
    <router-link
        to="/"
        class="nav-button"
        :class="{ active: $route.path === '/' }"
    >
       Предварительная запись
    </router-link>
    <router-link
        to="/registration"
        class="nav-button"
        :class="{ active: $route.path === '/registration' }"
    >
       Поставить в очередь
    </router-link>
  </div>
</template>

<script setup>
// Просто ссылки, логики не нужно
</script>

<style scoped>
.navigation-menu {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  max-width: 1200px;
  margin: 0 auto 20px;
}

.nav-button {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  transition: all 0.2s ease;
  background-color: #f3f4f6;
  border: 1px solid transparent;
}

.nav-button:hover {
  background-color: #e5e7eb;
  color: rgb(40, 96, 144);
}

.nav-button.active {
  background-color: rgb(40, 96, 144);
  color: white;
  border-color: rgb(30, 76, 114);
}

@media (max-width: 768px) {
  .navigation-menu {
    flex-direction: column;
    margin: 0 10px 20px;
  }

  .nav-button {
    text-align: center;
  }
}
</style>