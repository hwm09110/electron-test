<template>
  <div class="error">
    <h3 class="text">首页</h3>
    <div>
      <router-link to="/other/welcome">welcome {{ name }}</router-link>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    name: 'Home',
    data() {
      return {}
    },
    computed: {
      ...mapState(['name']),
    },
    created() {},
  }
</script>

<style lang="scss" scoped>
  .text {
    padding: 35px 0;
    text-align: center;
    font-size: 20px;
    font-weight: normal;
  }
</style>
