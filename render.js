window.addEventListener('DOMContentLoaded', () => {
  // document.getElementById('button2').onclick = function () {
  //   console.log('button2--->', window.commonAPI.getNumber())
  // }
  var vm = new Vue({
    el: '.container-wrap',
    delimiters: ['${', '}'],
    data: {
      basicInfo: {
        localDir: 'D:/workFile/all-php-project/php-project/',
        gdDir: 'D:/workFile/all-php-project/prodviews95/',
        hnDir: 'D:/workFile/all-php-project/prodviews50/',
        syncHeNan: true,
      },
      copyfile: `views\\support\\callpool\\recharge\\accountmanage.html
views\\support\\callpool\\recharge\\rechargedetail.html`,
      copyLog: '',
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
          this.copyLog += `<div><span>${
            this.basicInfo.gdDir + path
          }</span>----------><strong style="color:${res.isSuccess ? '#8ce6b0' : '#ff0000'}">${
            res.isSuccess ? '成功' : '失败'
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
            this.copyLog += `<div><span>${
              this.basicInfo.hnDir + path
            }</span>----------><strong style="color:${res.isSuccess ? '#8ce6b0' : '#ff0000'}">${
              res.isSuccess ? '成功' : '失败'
            }</strong></div>`
          }
        }
      },
    },
    created() {},
  })
  console.log(vm)
})
