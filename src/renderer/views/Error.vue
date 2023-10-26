<template>
  <div class="error">
    <h3 class="text">{{ tips }}</h3>
  </div>
</template>

<script>
export default {
  name: 'Error',
  data() {
    return {
      tips: '您没权限访问该页面或者该页面不存在！'
    };
  },
  created() {
    const { tips } = this.$route.query;
    this.tips = tips || '您没权限访问该页面或者该页面不存在！';
  }
};
</script>

<style lang="scss" scoped>
.text{
  padding: 35px 0;
  text-align: center;
  font-size: 20px;
  font-weight: normal;
}
</style>

