import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    name: '张三',
    isAppOnTop: false,
  },
  mutations: {
    setAppOnTopStatus(state, flag) {
      state.isAppOnTop = flag
    },
  },
})
