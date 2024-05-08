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
  { path: '/task/:id', component: viewTask, props: true, name: 'view-task' },
  { path: '/task/add', component: newTask, props: true, name: 'new-task' },
  { path: '/task/:id/edit', component: editTasks, props: true, name: 'edit-task' },
  { path: '/task/status', component: ManageStatus, props: true, name: 'manage-status' },
  { path: '/task/status/add', component: addStatus, props: true, name: 'add-status' },
  { path: '/task/status/:id', component: editStatus, props: true, name: 'edit-status' },

]


const router = createRouter({
  history: createWebHistory(),
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