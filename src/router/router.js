import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/tasks'
    },
    {
        path: '/tasks',
        component: TasksComponent
    },
    {
        path: '/task/:id',
        component: TaskComponent,
        beforeEnter: (to, from, next) => {
            const taskId = to.params.id;
            if (taskIdExists(taskId)) {
                next();
            } else {
                alert('Task not found');
                next('/tasks');
            }
        }
    },
    // other routes...
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;