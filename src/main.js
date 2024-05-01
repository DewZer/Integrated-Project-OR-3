import './assets/main.css'
import 'flowbite/dist/flowbite.min.css';
import 'flowbite/dist/flowbite.min.js';
import router from './router'


import { createApp } from 'vue'
import App from './App.vue'



createApp(App)
.use(router)
.mount('#app')
