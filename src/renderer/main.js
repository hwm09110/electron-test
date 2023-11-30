import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'
import '@/assets/css/reset.css'

/* 解决web环境下缺少window.require方法报错 */
if (process.env.BUILD_TARGET === 'web') {
  window.require = (...arg) => ({})
}

Vue.config.ignoredElements = ['wx-open-launch-weapp']
Vue.config.productionTip = false
Vue.prototype.$ipcRenderer = window.require('electron').ipcRenderer

Vue.use(ViewUI)

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
