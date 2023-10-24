import Vue from 'vue'
import './assets/css/index.css'

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('button2').onclick = function () {
    console.log('button2--->', window.commonAPI.getAppConfig())
  }
  var vm = new Vue({
    el: '.container-wrap',
    delimiters: ['${', '}'],
    data: {
      basicInfo: {
        localDir: '',
        gdDir: '',
        hnDir: '',
        syncHeNan: false,
      },
      copyfile: ``,
      copyLog: '',
      appConfig: null,
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
          if ((this.appConfig && Object.keys(this.appConfig).length) || loadCount == 10) {
            clearInterval(timer)
            return false
          }
          loadCount++
          this.appConfig = window.commonAPI.getAppConfig()
          console.log('appConfig-------', this.appConfig)
        }, 400)
      },
    },
    created() {
      this.getAppConfigInfo()
    },
  })
  console.log(vm)
})
