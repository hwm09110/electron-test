import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'
import '@/assets/css/reset.css'
import VueMarkdownEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'

// Prism
import Prism from 'prismjs'
// highlight code
import 'prismjs/components/prism-json'

VueMarkdownEditor.use(vuepressTheme, {
  Prism,
})

Vue.config.ignoredElements = ['wx-open-launch-weapp']
Vue.config.productionTip = false
Vue.prototype.$ipcRenderer = window.require('electron').ipcRenderer

Vue.use(ViewUI)
Vue.use(VueMarkdownEditor)

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
