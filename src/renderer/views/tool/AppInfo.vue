<template>
  <div class="container-wrap">
    <div class="base-info">
      <div class="item" v-for="(item, index) of appInfo" :key="index">
        <label>{{ item.name }}：</label>
        <p class="content"
          >{{ item.content }} &nbsp;&nbsp;<Button @click="handleCheckUpdate">检查更新</Button></p
        >
      </div>
    </div>
  </div>
</template>

<script>
  const pkg = require('../../../../package.json')
  export default {
    name: 'AppInfo',
    data() {
      return {
        appInfo: [
          {
            name: 'version',
            content: pkg.version,
          },
        ],
      }
    },
    methods: {
      handleCheckUpdate() {
        window.commonAPI.checkAppUpdate()
      },
    },
    created() {
      console.log('package', pkg)
    },
  }
</script>

<style lang="scss" scoped>
  .container-wrap {
    padding: 20px;
    .base-info {
      .item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        label {
          color: #000;
          text-align: right;
          margin-right: 5px;
          font-size: 15px;
        }
        .content {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
</style>

