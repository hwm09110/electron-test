<template>
  <div class="container-wrap">
    <div class="left">
      <div class="base-info">
        <div class="item">
          <label>根目录(FROM)：</label>
          <input type="text" class="dir-input" v-model="basicInfo.localDir" />
        </div>
        <div class="item">
          <label>广东根目录(TO)：</label>
          <input type="text" class="dir-input" v-model="basicInfo.gdDir" spellcheck="false" />
        </div>
        <div class="item">
          <label>河南根目录(TO)：</label>
          <input type="text" class="dir-input" v-model="basicInfo.hnDir" spellcheck="false" />
        </div>
        <div class="item">
          <label>是否同步到河南：</label>
          <input type="checkbox" v-model="basicInfo.syncHeNan" spellcheck="false" />
        </div>
        <div class="item">
          <button class="confirm-btn" @click="handleConfirm">确定</button>
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
</template>

<script>
  export default {
    name: 'Welcome',
    data() {
      return {
        basicInfo: {
          localDir: '',
          gdDir: '',
          hnDir: '',
          syncHeNan: false,
        },
        copyfile: ``,
        copyLog: '',
        appConfig: null,
      }
    },
    watch: {
      appConfig(newVal) {
        if (newVal && Object.keys(newVal).length) {
          this.basicInfo.localDir = newVal?.local ?? ''
          this.basicInfo.gdDir = newVal?.guangdong ?? ''
          this.basicInfo.hnDir = newVal?.henan ?? ''
        }
      },
    },
    methods: {
      handleConfirm() {
        console.log(this.basicInfo)
        console.log(this.copyfile)
        console.log(window.commonAPI.copyFile)
        if (!this.copyfile.trim()) {
          alert('填写需要copy的文件路径')
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
          const res = await window.commonAPI.copyFile(
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
        if (this.basicInfo.syncHeNan) {
          this.copyLog += '<br/><br/><br/><h2>【河南】↓↓↓</h2>'
          for (let index = 0, len = copyFilePathList.length; index < len; index++) {
            const path = copyFilePathList[index]
            const res = await window.commonAPI.copyFile(
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
      // 获取配置
      getAppConfigInfo() {
        let loadCount = 0
        let timer = setInterval(() => {
          if ((this.appConfig && Object.keys(this.appConfig).length) || loadCount == 5) {
            clearInterval(timer)
            return false
          }
          loadCount++
          try {
            this.appConfig = window.commonAPI.getAppConfig()
            console.log('appConfig-------', this.appConfig)
          } catch (error) {
            console.log('getAppConfigInfo catch', error)
          }
        }, 400)
      },
    },
    created() {
      this.getAppConfigInfo()
    },
  }
</script>

<style lang="scss" scoped>
  .container-wrap {
    display: flex;
    padding: 10px 0;
    > div {
      flex: 1;
      border: 1px solid #dcdcdc;
      margin: 0 10px;
      overflow-y: auto;
      padding: 15px;
    }
    .base-info {
      .item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        label {
          width: 150px;
          text-align: right;
          margin-right: 5px;
        }
        .dir-input {
          width: 400px;
          height: 30px;
          border-radius: 4px;
          border: 1px solid #dcdcdc;
          outline: none;
          box-sizing: border-box;
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
</style>

