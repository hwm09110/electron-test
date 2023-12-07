<template>
  <div class="container-wrap">
    <v-md-editor v-model="text" height="400px"></v-md-editor>
  </div>
</template>

<script>
  const readmeContent = require('../../../../README.md')
  export default {
    name: 'Readme',
    data() {
      return {
        text: readmeContent,
      }
    },
  }
</script>

<style lang="scss" scoped>
  .container-wrap {
  }
</style>
