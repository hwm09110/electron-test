const path = require('path')
const fs = require('fs')
const { app, BrowserWindow, ipcMain } = require('electron')
const checkAppUpdate = require('./lib/appUpdate')
const logger = require('./lib/logger')
const initAppTray = require('./lib/appTray')

const remote = require('@electron/remote/main')
remote.initialize()

const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

let mainWindow
const createWindow = () => {
  mainWindow = new BrowserWindow({
    icon: '../../public/icons/favicon.png',
    frame: false, // false去掉顶部自动导航
    minWidth: 1200,
    height: 750,
    webPreferences: {
      devTools: process.env.NODE_ENV === 'development',
      // preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true,
      nodeIntegration: true, // 是否允许web端使用node
      contextIsolation: false, // 上下文隔离功能将确保您的预加载脚本 和 Electron的内部逻辑 运行在所加载的webcontent网页 之外的另一个独立的上下文环境里 | 是否允许自定义preload脚本，设置为true后，web页面里面window.require('electron').ipcRenderer会报错
    },
  })
  // mainWindow.loadFile(winURL)
  mainWindow.loadURL(winURL)
  // 打开开发工具
  mainWindow.webContents.openDevTools()
  remote.enable(mainWindow.webContents)

  // 设置系统托盘
  initAppTray(mainWindow)

  // mainWindow.webContents.on('did-finish-load', () => {
  //   setInterval(() => {
  //     mainWindow.webContents.send('appUpdateMessage', '这是主进程的主动搭讪')
  //   }, 2000)
  // })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  checkAppUpdate(mainWindow)
  logger.info('app ready~~~~~' + path.dirname(app.getPath('exe')))
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 限制只能打开一个页面
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// 监听渲染进程发送的消息
ipcMain.on('asynchronous-message', async (event, reply_command) => {
  // 发送消息到主进程
  switch (reply_command) {
    case 'getExePath':
      const data = await getAppConfig().catch((er) => {
        logger.info('getAppConfig error', er)
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
      ? path.join(__dirname, '../../public/config.json')
      : exeDirName + '/resources/public/config.json'
  }`
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
