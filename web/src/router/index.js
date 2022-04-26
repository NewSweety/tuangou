import Vue from 'vue';
import VueRouter from 'vue-router';
import index from '@/views/index.vue';
import moment from 'moment';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'index',
    component: index,
    meta: { title: '团购核销' }
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
