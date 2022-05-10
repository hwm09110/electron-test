// 引入 ipcRenderer 模块。
const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('commonAPI', {
  getNumber: () => { console.log(123) }
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }

  document.getElementById('process').innerText = JSON.stringify(process.versions)


  document.getElementById('button').onclick = function () {
    var message = document.getElementById('message').value;
    // 使用 ipcRenderer.send 向主进程发送消息。
    console.log('button--->', window.commonAPI)
    ipcRenderer.send('asynchronous-message', message);
  }

  // 监听主进程返回的消息
  ipcRenderer.on('asynchronous-reply', function (event, arg) {
    alert(arg);
  });
})
