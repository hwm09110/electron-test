try {
  require('electron-reloader')(module, {})
} catch (_) {}

const path = require('path')
const { app, BrowserWindow, ipcMain } = require('electron')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    minWidth: 1200,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  mainWindow.loadFile('index.html')
  // mainWindow.loadURL('https://www.baokaodaxue.com')
  // 打开开发工具
  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 监听渲染进程发送的消息
ipcMain.on('asynchronous-message', (event, arg) => {
  const reply = arg.split('').reverse().join('')
  console.log('reply: ', reply)
  // 发送消息到主进程
  event.sender.send('asynchronous-reply', reply)
})
