import Vue from 'vue';
import VueRouter from 'vue-router';
import index from '@/views/index.vue';
import importing from '@/views/importing.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'index',
    component: index,
    meta: { title: '团购核销' },
  },
  {
    path: '/importing',
    name: 'importing',
    component: importing,
    meta: { title: '团购核销管理' },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
