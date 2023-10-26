import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'
import '@/assets/css/reset.css'

Vue.config.ignoredElements = ['wx-open-launch-weapp']
Vue.config.productionTip = false

Vue.use(ViewUI)

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
