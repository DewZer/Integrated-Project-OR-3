import './assets/main.css'
import 'flowbite/dist/flowbite.min.css';
import 'flowbite/dist/flowbite.min.js';
import { createRouter, createWebHistory } from 'vue-router'
import tasks from './components/tasks.vue'
import { createApp } from 'vue'
import App from './App.vue'
import editTasks from './components/editTasks.vue'
import newTask from './components/newTask.vue';
import viewTask from './components/viewTask.vue';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import ManageStatus from './components/manageStatus.vue';
import addStatus from './components/addStatus.vue';
import editStatus from './components/editStatus.vue';

const routes = [
  { path: '/task', component: tasks },
  { path: '/', redirect: '/task' },
  { path: '/:pathMatch(.*)*', redirect: '/task' },
  { path: '/task/:id', component: viewTask, props: true, name: 'View Task' },
  { path: '/task/add', component: newTask, props: true, name: 'Add Task' },
  { path: '/task/:id/edit', component: editTasks, props: true, name: 'Edit Task' },
  { path: '/task/status', component: ManageStatus, props: true, name: 'Manage Status' },
  { path: '/task/status/add', component: addStatus, props: true, name: 'Add Status' },
  { path: '/task/status/:id', component: editStatus, props: true, name: 'Edit Status' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
router.beforeEach((to, from, next) => {
  document.title = to.name || 'ITBKK-Kradan Kanban';
  next();
});

createApp(App)
  .use(router)
  .use(Toast)
  .mount('#app')