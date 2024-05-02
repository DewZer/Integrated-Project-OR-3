import './assets/main.css'
import 'flowbite/dist/flowbite.min.css';
import 'flowbite/dist/flowbite.min.js';
import { createRouter, createWebHistory } from 'vue-router'
import task from './components/task.vue'
import { createApp } from 'vue'
import App from './App.vue'
import editTasks from './components/editTasks.vue'
import newTask from './components/newTask.vue';

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const routes = [
  { path: '/task', component: task },
  { path: '/', redirect: '/tasks' },
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