<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    name: 'APP',
    data() {
      return {
        showNavBar: false, // 显示顶部导航条
        navTitle: document.title, // 导航标题
      }
    },
    computed: {
      ...mapState(['cacheRoute']),
    },
    watch: {
      $route: function (newVal) {
        if (newVal.meta.title) {
          this.navTitle = newVal.meta.title
        }
      },
    },
    async created() {},
    methods: {},
  }
</script>

<style lang="scss">
  html,
  body {
    width: 100%;
    height: 100%;
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100%;
    height: 100%;
    min-height: 100%;
  }

  .modal-open {
    position: fixed;
    width: 100%;
  }
</style>
