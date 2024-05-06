import './assets/main.css'
import 'flowbite/dist/flowbite.min.css';
import 'flowbite/dist/flowbite.min.js';
import { createRouter, createWebHistory } from 'vue-router'
import tasks from './components/tasks.vue'
import { createApp } from 'vue'
import App from './App.vue'
import editTasks from './components/editTasks.vue'
import newTask from './components/newTask.vue';

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const routes = [
  { path: '/task', component: tasks },
  { path: '/', redirect: '/task' },
  { path: '/:pathMatch(.*)*', redirect: '/task' },
  { path: '/task/:id', component: editTasks, props: true, name: 'editTasks' },
  { path: '/task/add', component: newTask, props: true, name: 'newTask' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


createApp(App)
  .use(router)
  .use(Toast)
  .mount('#app')