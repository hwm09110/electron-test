<template>
  <div class="container-wrap">
    <div class="base-info">
      <div class="item" v-for="(item, index) of appInfo" :key="index">
        <label>{{ item.name }}：</label>
        <div class="content">
          <p
            >{{ item.content }} &nbsp;&nbsp;<Button
              @click="handleCheckUpdate"
              :disabled="isChecking"
              >{{ btnText }}</Button
            ><Progress
              v-show="isChecking && donwloadPercentage > 0"
              style="width: 500px; margin-left: 20px"
              :percent="donwloadPercentage"
              :stroke-width="20"
              status="active"
              text-inside
          /></p>
        </div>
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
            content: 'V' + pkg.version,
          },
        ],
        isChecking: false,
        donwloadPercentage: 0,
      }
    },
    computed: {
      btnText() {
        return this.isChecking ? '正在检查更新' : '检查更新'
      },
    },
    methods: {
      handleCheckUpdate() {
        if (this.isChecking) return false
        this.$ipcRenderer.send('check-for-update')
      },
      initAppUpdateEventHandler() {
        // this.$ipcRenderer.off('appUpdateMessage', this.updateHandler)
        this.$ipcRenderer.on('appUpdateMessage', this.updateHandler)
      },
      updateHandler(ev, data) {
        console.log('appUpdateMessage message ---> ', data)
        const { status } = data
        switch (Number(status)) {
          case 1: //触发检查更新
            this.isChecking = true
            break
          case 2: //更新异常
            this.$Modal.error({
              title: '提示',
              content: `${data.msg}`,
              onOk: () => {
                this.isChecking = false
              },
            })
            break
          case 3: //正在检查更新
            this.isChecking = true
            break
          case 4: //检查到有新版本
            this.$Modal.confirm({
              title: '提示',
              content: '发现新版本，是否现在更新？',
              onOk: () => {
                this.$ipcRenderer.send('download-update') // 开始下载
                this.isChecking = true
              },
              onCancel: () => {
                this.isChecking = false
              },
            })
            break
          case 5: //没有新版本
            this.$Modal.info({
              title: '提示',
              content: `已经是最新版本！`,
              onOk: () => {
                this.isChecking = false
              },
            })
            break
          case 6: //正在下载
            this.isChecking = true
            this.donwloadPercentage = parseFloat(data.progress.percent.toFixed(2))
            break
          case 7: //下载完成
            this.isChecking = false
            setTimeout(() => {
              this.$Modal.confirm({
                title: '提示',
                content: '更新下载完毕，应用将重启并进行安装?',
                onOk: () => {
                  console.log('app-install~~~')
                  this.$ipcRenderer.send('app-install') // 开始安装
                },
                onCancel: () => {},
              })
            }, 400)
            break
        }
      },
    },
    mounted() {
      console.log('package', pkg)
      console.log('this.$ipcRenderer', this.$ipcRenderer)
      this.initAppUpdateEventHandler()
    },
    destroyed() {
      this.$ipcRenderer.off('appUpdateMessage', this.updateHandler)
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
