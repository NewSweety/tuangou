// import 'babel-polyfill';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false;
Vue.use(ElementUI);

Vue.directive('enterSearch', {
  inserted(el) {
    el.addEventListener('input', e => {
      e = e || window.event;
      let re = /^[\u4e00-\u9fa5a-zA-Z0-9\' ]+$/;
      // 不匹配时
      if (!re.test(e.data) || e.data == null) {
        e.target.value = e.target.value.replace(
          /[^\a-\z\A-\Z0-9\u4E00-\u9FA5]/g,
          ''
        );
      } else if (e.data == `'` || e.data == ' ') {
        e.target.value = e.target.value.replace(
          /[^\a-\z\A-\Z0-9\u4E00-\u9FA5]/g,
          ''
        );
      }
    });
  },
});

new Vue({
  router,
  render: h => {
    // 兼容ie11
    if (
      '-ms-scroll-limit' in document.documentElement.style &&
      '-ms-ime-align' in document.documentElement.style
    ) {
      window.addEventListener(
        'hashchange',
        () => {
          let currentPath = window.location.hash.slice(1);
          if (this.$route.path !== currentPath) {
            this.$router.push(currentPath);
          }
        },
        false
      );
    }
    return h(App);
  },
}).$mount('#app');
