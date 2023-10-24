// 引入 ipcRenderer 模块。
const { ipcRenderer, contextBridge } = require('electron')
const fs = require('fs')
const path = require('path')

let appConfig = null
contextBridge.exposeInMainWorld('commonAPI', {
  getAppConfig: () => {
    console.log(123, appConfig)
    return appConfig
  },
  copyFile,
})

window.addEventListener('DOMContentLoaded', () => {
  console.log('preload.js --- DOMContentLoaded')
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }

  document.getElementById('process').innerText = JSON.stringify(process.versions)

  document.getElementById('button').onclick = function () {
    var message = document.getElementById('message').value
    console.log('button1--->', window.commonAPI)
  }

  // 使用 ipcRenderer.send 向主进程发送消息。
  ipcRenderer.send('asynchronous-message', 'getExePath')

  // 监听主进程返回的消息
  ipcRenderer.on('getExePath', function (event, data) {
    console.log('监听主进程返回的消息', data)
    appConfig = data
  })
})

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
