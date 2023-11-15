// const { ipcRenderer, contextBridge } = require('electron')
const fs = require('fs')

// const mainWin = getCurrentWindow()

// let appConfig = null
// contextBridge.exposeInMainWorld('commonAPI', {
//   getAppConfig: () => {
//     return appConfig
//   },
//   copyFile,
//   getNumbers,
// })

// window.addEventListener('DOMContentLoaded', () => {
//   console.log('preload.js --- DOMContentLoaded')

//   // 使用 ipcRenderer.send 向主进程发送消息。
//   // ipcRenderer.send('main-asynchronous-message', 'getExePath')

//   // 监听主进程返回的消息
//   ipcRenderer.on('getExePath', function (event, data) {
//     console.log('监听主进程返回的消息', data)
//     appConfig = data
//   })
// })

function copyFile(sourcePath, destinationPath) {
  return new Promise((resolve, _reject) => {
    // 读取源文件
    fs.readFile(sourcePath, (err, data) => {
      if (err) {
        resolve({ isSuccess: false, path: sourcePath, error: err })
        return
      }

      // 写入目标文件
      fs.writeFile(destinationPath, data, (err) => {
        if (err) {
          resolve({ isSuccess: false, path: sourcePath, error: err })
          return
        }
        resolve({ isSuccess: true, path: sourcePath })
      })
    })
  })
}

function getNumbers() {
  return Array.from({ length: 10 }, (n, i) => i + 1)
}

module.exports = {
  copyFile,
  getNumbers,
}
