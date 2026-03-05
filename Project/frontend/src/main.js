import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { createPinia } from 'pinia'
import HomeView from './views/HomeView.vue'
import RegistrationView from './views/RegistrationView.vue' // <-- НОВЫЙ ИМПОРТ
import './assets/main.css'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: HomeView },           // главная страница - предрегистрация
        { path: '/registration', component: RegistrationView } // новая страница
    ]
})

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.mount('#app')