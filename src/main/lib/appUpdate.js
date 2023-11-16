const path = require('path')
const { autoUpdater } = require('electron-updater')
const { app, ipcMain, dialog } = require('electron')
const logger = require('./logger')

// dev-start, 这里是为了在本地做应用升级测试使用，正式环境请务必删除
if (process.env['NODE_ENV'] === 'development') {
  autoUpdater.updateConfigPath = path.join(__dirname, '../../dev-app-update.yml')
  autoUpdater.currentVersion = '0.0.1' // fix：在本地调试时会去取electron的版本，而不是app的版本
}
// 设置应用状态为已打包
Object.defineProperty(app, 'isPackaged', {
  get() {
    return true
  },
})
// dev-end

function checkAppUpdate(win) {
  // 触发检查更新(此方法用于被渲染线程调用，例如页面点击检查更新按钮来调用此方法)
  ipcMain.on('check-for-update', () => {
    autoUpdater.checkForUpdates()
    logger.info('autoUpdater触发检查更新check-for-update')
    sendUpdateMsg({ status: 1, event: 'checkForUpdates', msg: '触发检查更新' })
  })

  ipcMain.on('download-update', () => {
    logger.info('autoUpdater 开始下载新版本')
    // 下载更新
    autoUpdater
      .downloadUpdate()
      .then((downloadPath) => {
        logger.info('autoUpdater 新版本下载完成')
        logger.info('dowload path:', downloadPath)
      })
      .catch((error) => {
        logger.error('新版本下载失败：', JSON.stringify(error))
      })
  })

  ipcMain.on('app-install', () => {
    logger.info('autoUpdater 开始安装新版本')
    setTimeout(() => {
      autoUpdater.quitAndInstall()
    }, 500)
  })

  // 设置自动下载为false(默认为true，检测到有更新就自动下载)
  autoUpdater.autoDownload = false
  // 如果安装包已经下载好，当应用退出后是否自动安装更新
  autoUpdater.autoInstanllOnAppQuit = true

  // 检测下载错误
  autoUpdater.on('error', (error) => {
    logger.info('autoUpdater error', error)
    sendUpdateMsg({ status: 2, event: 'error', msg: '检查更新异常:' + error })
  })

  // 检测是否需要更新
  autoUpdater.on('checking-for-update', () => {
    logger.info('autoUpdater 正在检查更新……')
    sendUpdateMsg({ status: 3, event: 'checking-for-update', msg: '正在检查更新' })
  })

  // 检测到可以更新时
  autoUpdater.on('update-available', (releaseInfo) => {
    logger.info('autoUpdater 检测到新版本，确认是否下载', releaseInfo)
    sendUpdateMsg({ status: 4, event: 'update-available', msg: '检查到有新版本:', releaseInfo })
    const releaseNotes = releaseInfo.releaseNotes
    let releaseContent = ''
    if (releaseNotes) {
      if (typeof releaseNotes === 'string') {
        releaseContent = releaseNotes
      } else if (releaseNotes instanceof Array) {
        releaseNotes.forEach((releaseNote) => {
          releaseContent += `${releaseNote}\n`
        })
      }
    } else {
      releaseContent = '暂无更新说明'
    }
  })

  // 检测到不需要更新时
  autoUpdater.on('update-not-available', () => {
    logger.info('autoUpdater 现在使用的就是最新版本，不用更新')
    sendUpdateMsg({ status: 5, event: 'update-not-available', msg: '没有新版本' })
    // dialog.showMessageBox({
    //   title: '提示',
    //   message: '现在使用的就是最新版本，不用更新',
    // })
  })

  // 更新下载进度
  autoUpdater.on('download-progress', (progress) => {
    logger.info('autoUpdater 下载进度', progress)
    sendUpdateMsg({ status: 6, event: 'download-progress', msg: '正在下载', progress })
  })

  // 当需要更新的内容下载完成后
  autoUpdater.on('update-downloaded', () => {
    console.info('下载完成，准备更新')
    logger.info('autoUpdater 下载完成，准备更新')
    sendUpdateMsg({ status: 7, event: 'update-downloaded', msg: '下载完成' })
  })

  function sendUpdateMsg(data) {
    win.webContents.send('appUpdateMessage', data)
  }
}

module.exports = checkAppUpdate
