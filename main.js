try {
  require('electron-reloader')(module, {})
} catch (_) {}

const path = require('path')
const fs = require('fs')
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
ipcMain.on('asynchronous-message', async (event, reply_command) => {
  // 发送消息到主进程
  switch (reply_command) {
    case 'getExePath':
      const data = await getAppConfig().catch((er) => {
        console.log('getAppConfig error', er)
      })
      event.sender.send(reply_command, data)
      break

    default:
      event.sender.send(reply_command, exePath)
      break
  }
})

function getAppConfig() {
  const exeDirName = path.dirname(app.getPath('exe')).replace('/\\/g', '/')
  const configPath = `${process.env.NODE_ENV == 'development' ? __dirname : exeDirName}/config.json`
  // console.log('configPath-->', configPath)
  // console.log('process.env-->', process.env.NODE_ENV)
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, 'utf-8', (err, data) => {
      if (err) {
        return reject(err)
      }
      if (data) {
        resolve(JSON.parse(data))
      }
    })
  })
}
