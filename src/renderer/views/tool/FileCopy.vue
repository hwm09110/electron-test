<template>
  <div class="container-wrap">
    <div class="inner-wrap">
      <div class="left">
        <div class="base-info">
          <div class="set-btn" @click="handleGoSet"
            ><Icon type="md-cog" size="22" color="#5cadff"
          /></div>
          <div class="item">
            <div class="label">本地根目录(FROM)：</div>
            <Input class="dir-input" v-model="basicInfo.localDir" />
          </div>
          <div class="item">
            <div class="label">广东根目录(TO)：</div>
            <Input class="dir-input" v-model="basicInfo.gdDir" />
          </div>
          <div class="item">
            <div class="label">河南根目录(TO)：</div>
            <Input class="dir-input" v-model="basicInfo.hnDir" />
          </div>
          <div class="item">
            <div class="label">是否同步到河南：</div>
            <Checkbox v-model="basicInfo.isSync" />
          </div>
          <div class="item">
            <button class="confirm-btn" @click="handleConfirm">确定</button>
            <!-- <button class="confirm-btn" @click="handleRemoting">远程调用</button> -->
          </div>
        </div>
        <div>
          <textarea
            class="file-info"
            placeholder="每个文件目录单独一行,列如：views/support/callpool/recharge/rechargedetail.html"
            v-model="copyfile"
            spellcheck="false"
          ></textarea>
        </div>
      </div>
      <div class="right" v-html="copyLog"></div>
    </div>
    <BasicSetModal v-model="showBasicSetModal" :config="basicInfo" @on-success="handleSetSuccess" />
  </div>
</template>

<script>
  const fs = window.require('fs')
  const path = window.require('path')
  import BasicSetModal from './components/BasicSetModal.vue'

  export default {
    components: { BasicSetModal },
    name: 'FileCopy',
    data() {
      return {
        basicInfo: {
          localDir: '',
          gdDir: '',
          hnDir: '',
          isSync: false,
        },
        copyfile: ``,
        copyLog: '',
        appConfig: null,
        showBasicSetModal: false,
      }
    },
    watch: {
      appConfig(newVal) {
        if (newVal && Object.keys(newVal).length) {
          this.basicInfo.localDir = newVal?.localDir ?? ''
          this.basicInfo.gdDir = newVal?.gdDir ?? ''
          this.basicInfo.hnDir = newVal?.hnDir ?? ''
          this.basicInfo.isSync = newVal?.isSync ?? false
        }
      },
    },
    methods: {
      handleGoSet() {
        this.showBasicSetModal = true
      },
      handleSetSuccess() {
        this.getAppConfigInfo()
      },

      handleConfirm() {
        if (!this.copyfile.trim()) {
          this.$Message.warning('填写需要copy的文件路径')
          return
        }
        this.copyLog = ''
        this.batchCopyFile()
      },
      getCopyFilePaths() {
        return this.copyfile
          .replace(/\n/g, '|')
          .replace(/\\/g, '/')
          .split('|')
          .map((path) => {
            return path.replace(/.*\/(views\/.+)/g, '$1')
          })
      },
      // 批量copy
      async batchCopyFile() {
        const copyFilePathList = this.getCopyFilePaths()
        console.log('copyFilePathList', copyFilePathList)
        // 广东
        this.copyLog += '<h2>【广东】↓↓↓</h2>'
        for (let index = 0, len = copyFilePathList.length; index < len; index++) {
          const path = copyFilePathList[index]
          const res = await this.copyFile(
            this.basicInfo.localDir + path,
            this.basicInfo.gdDir + path,
          )
          console.log(res)
          this.copyLog += `<br/><div><strong style="color:${
            res.isSuccess ? '#19be6b' : '#ed4014'
          }">COPY${
            res.isSuccess
              ? `成功--->${this.basicInfo.localDir + path}`
              : `失败--->${res.error.message}`
          }</strong></div>`
        }

        // 河南
        if (this.basicInfo.isSync) {
          this.copyLog += '<br/><br/><br/><h2>【河南】↓↓↓</h2>'
          for (let index = 0, len = copyFilePathList.length; index < len; index++) {
            const path = copyFilePathList[index]
            const res = await this.copyFile(
              this.basicInfo.localDir + path,
              this.basicInfo.hnDir + path,
            )
            console.log(res)
            this.copyLog += `<br/><div><strong style="color:${
              res.isSuccess ? '#19be6b' : '#ed4014'
            }">COPY${
              res.isSuccess
                ? `成功--->${this.basicInfo.localDir + path}`
                : `失败--->${res.error.message}`
            }</strong></div>`
          }
        }
      },
      //使用node api copy文件
      copyFile(sourcePath, destinationPath) {
        return new Promise((resolve, _reject) => {
          // 检查目标目录是否存在
          const destinationDir = path.dirname(destinationPath)
          if (!fs.existsSync(destinationDir)) {
            // 目标目录不存在，先创建目录
            fs.mkdirSync(destinationDir, { recursive: true })
          }
          // 拷贝文件
          fs.copyFile(sourcePath, destinationPath, (err) => {
            if (err) {
              resolve({ isSuccess: false, path: sourcePath, error: err })
              return
            }
            resolve({ isSuccess: true, path: sourcePath })
          })
        })
      },
      // 获取配置
      getAppConfigInfo() {
        this.$ipcRenderer.once('getAppCongfig', (event, data) => {
          this.appConfig = data
        })
        this.$ipcRenderer.send('main-asynchronous-message', { replyCommand: 'getAppCongfig' })
      },

      async handleRemoting() {
        const remote = window.require('@electron/remote')
        console.log('remote--->', remote)

        // remote.shell.openExternal('https://github.com') //打开本地浏览器

        // remote.app.quit()

        // const memoryInfo = await remote.app.getAppMetrics()
        // console.log('memoryInfo', memoryInfo)

        // let win = new remote.BrowserWindow({ width: 800, height: 600 })
      },
    },
    created() {
      this.getAppConfigInfo()
    },
  }
</script>

<style lang="scss" scoped>
  .container-wrap {
    .inner-wrap {
      display: flex;
      padding: 10px 0;
      > div {
        border: 1px solid #dcdcdc;
        margin: 0 10px;
        overflow-y: auto;
        padding: 15px;
      }
      .left {
        width: 600px;
      }
      .right {
        flex: 1;
      }
      .base-info {
        position: relative;
        padding-top: 20px;
        .item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          .label {
            width: 180px;
            text-align: right;
            margin-right: 5px;
          }
          .dir-input {
            width: 400px;
            padding-left: 10px;
          }
        }
        .confirm-btn {
          width: 120px;
          height: 35px;
          line-height: 35px;
          text-align: center;
          border-radius: 4px;
          background-color: #108de9;
          color: #fff;
          font-size: 14px;
          outline: none;
          padding: 0;
          margin: 0 auto;
          border: none;
          cursor: pointer;
        }
        .set-btn {
          position: absolute;
          top: -10px;
          right: -10px;
          cursor: pointer;
        }
      }
      .file-info {
        width: 100%;
        height: 400px;
        border-radius: 4px;
        padding: 10px;
        box-sizing: border-box;
        border: 1px solid #dcdcdc;
        outline: none;
      }
    }
  }
</style>
