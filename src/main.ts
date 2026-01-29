import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { initializeAuth } from './API/auth'
import { setRouter } from './API/index'

// Set the router instance in the axios interceptor
setRouter(router)

// Initialize authentication from localStorage
initializeAuth()

// Create the Vue app
const app = createApp(App)

// Register plugins
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// Mount the app
app.mount('#app')
