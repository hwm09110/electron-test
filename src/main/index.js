const path = require('path')
const fs = require('fs')
const { app, BrowserWindow, ipcMain } = require('electron')
const { initAppUpdate } = require('./lib/appUpdate')
const logger = require('./lib/logger')
const initAppTray = require('./lib/appTray')

const remote = require('@electron/remote/main')
remote.initialize()

let winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${path.resolve(__dirname, '..')}/renderer/index.html`

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
  if (process.env.NODE_ENV === 'production') {
    // 从app.asar分离renderer
    // const exeDirName = path.dirname(app.getPath('exe')).replace('/\\/g', '/')
    // winURL = `file://${exeDirName}/resources/app.asar.unpacked/dist/electron/renderer/index.html`
  }
  mainWindow.loadURL(winURL)

  logger.info('renderer winURL: ' + winURL)
  logger.info('process.versions: ', process.versions)

  // 打开开发工具
  mainWindow.webContents.openDevTools()
  remote.enable(mainWindow.webContents)

  // 设置系统托盘
  initAppTray(mainWindow)
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  initAppUpdate(mainWindow)
  logger.info('app ready~~~~~' + path.dirname(app.getPath('exe')))
  logger.info('__dirname：' + __dirname)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 限制只能打开一个页面
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    // 输出从第二个实例中接收到的数据
    console.log(additionalData)
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// 监听渲染进程发送的消息
ipcMain.on('main-asynchronous-message', async (event, { replyCommand, extraData }) => {
  console.log('main-asynchronous-message:', replyCommand, extraData)
  // 发送消息到主进程
  switch (replyCommand) {
    case 'getAppCongfig':
      const data = await getAppConfig().catch((er) => {
        logger.info('getAppConfig error', er)
      })
      logger.info('getAppCongfig', JSON.stringify(data))
      event.sender.send(replyCommand, data)
      break
    case 'setAppCongfig':
      setAppCongfig(extraData).catch((er) => {
        logger.info('setAppCongfig error', er)
      })
      event.sender.send(replyCommand, data)
      break

    default:
      event.sender.send(replyCommand, exePath)
      break
  }
})

function getAppConfigPath() {
  const exeDirName = path.dirname(app.getPath('exe')).replace('/\\/g', '/')
  const configPath = `${
    process.env.NODE_ENV == 'development'
      ? path.join(__dirname, '../../../public/config.json')
      : exeDirName + '/resources/public/config.json'
  }`
  return configPath
}
// 获取应用配置信息
function getAppConfig() {
  const configPath = getAppConfigPath()
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

// 设置应用配置信息
function setAppCongfig(data) {
  logger.info('setAppCongfig-->', data)
  return new Promise((resolve, reject) => {
    try {
      const configPath = getAppConfigPath()
      const jsonData = JSON.stringify(data, null, 2)
      fs.writeFileSync(configPath, jsonData, 'utf-8')
      logger.info('文件写入成功！', jsonData)
      resolve({ write: 'success', jsonData })
    } catch (error) {
      logger.info('写入文件时出错：', error)
      return reject(error)
    }
  })
}
