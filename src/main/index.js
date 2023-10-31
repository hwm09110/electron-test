const path = require('path')
const fs = require('fs')
const { app, BrowserWindow, ipcMain } = require('electron')
const checkAppUpdate = require('./lib/appUpdate')
const logger = require('./lib/logger')

const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    minWidth: 1200,
    height: 750,
    webPreferences: {
      devTools: process.env.NODE_ENV === 'development',
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, // 是否允许web端使用node
      contextIsolation: true, // 是否允许自定义preload脚本
    },
  })
  // mainWindow.loadFile(winURL)
  mainWindow.loadURL(winURL)
  // 打开开发工具
  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  checkAppUpdate()
  logger.info('app ready~~~~~' + path.dirname(app.getPath('exe')))
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
  const configPath = `${
    process.env.NODE_ENV == 'development'
      ? path.join(__dirname, 'config.json')
      : exeDirName + '/config.json'
  }`
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
