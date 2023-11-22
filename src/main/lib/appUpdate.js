const path = require('path')
const fs = require('fs')
const AdmZip = require('adm-zip')
const { autoUpdater } = require('electron-updater')
const { app, ipcMain, net } = require('electron')
const logger = require('./logger')
const { getAppExeDir, isDirectoryExists } = require('./utils')

// dev-start, 这里是为了在本地做应用升级测试使用，正式环境请务必删除
if (process.env['NODE_ENV'] === 'development') {
  autoUpdater.updateConfigPath = path.join(__dirname, '../../../dev-app-update.yml')
  autoUpdater.currentVersion = '0.0.1' // fix：在本地调试时会去取electron的版本，而不是app的版本
}
// 设置应用状态为已打包
Object.defineProperty(app, 'isPackaged', {
  get() {
    return true
  },
})
// dev-end

let mainWin = null
const getLatestPatchVersionUrl = 'http://192.168.8.172:3600/resource/app/pack/hotVersion.json'
const getLatestPatchZipUrl = 'http://192.168.8.172:3600/resource/app/pack/unpacked.zip'

function initAppUpdate(win, autoCheck = false) {
  mainWin = win
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
    // 检查是否有增量更新
    checkPatckUpdate()
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

// 获取当前hot版本号
function getCurrrentPatchVersion() {
  const hotVerPath = `${getAppExeDir()}/resources/hotVersion.json`
  logger.info('getCurrrentHotVersion：', hotVerPath)
  return new Promise((resolve, reject) => {
    fs.readFile(hotVerPath, 'utf-8', (err, data) => {
      if (err) {
        logger.error('getCurrrentHotVersion：', err)
        return reject(err)
      }
      if (data) {
        logger.info('currrentHotVersion：', JSON.parse(data)?.version)
        resolve(JSON.parse(data)?.version)
      }
    })
  })
}

// 获取远程热更新版本号
function getRemotePatchVersion() {
  return new Promise((resolve, reject) => {
    const request = net.request({
      url: getLatestPatchVersionUrl,
      method: 'get',
    })
    request.on('response', (response) => {
      if (response.statusCode === 200) {
        response.on('data', (chunk) => {
          logger.info('getRemotePatchVersion chunk', chunk.toString())
          resolve(JSON.parse(chunk.toString()).version)
        })
        response.on('end', () => {
          logger.info('getRemotePatchVersion end')
        })
      } else {
        logger.error('getRemotePatchVersion response', response)
        reject(response)
      }
    })
    request.on('error', (error) => {
      logger.error('getRemotePatchVersion 网络异常: ', error)
      reject(error)
    })
    request.end()
  })
}

// 下载热更新包
function downloadHotPackFileZip(targetPath) {
  return new Promise((resolve, reject) => {
    try {
      const request = net.request({
        url: getLatestPatchZipUrl,
        method: 'get',
      })

      request.on('response', (response) => {
        const contentLength = response.headers['content-length']
        let receivedBytes = 0
        logger.info(`文件size: ${contentLength}`, response)

        // 保存文件到本地
        const outFile = fs.createWriteStream(targetPath)
        response.pipe(outFile)

        response.on('data', (chunk) => {
          receivedBytes += chunk.length
          // 更新下载进度
          const progress = (receivedBytes / contentLength) * 100
          // logger.info(`下载进度: ${progress}%`)
        })

        response.on('end', () => {
          logger.info('文件下载完成')
          outFile.end()
          resolve()
        })
      })

      request.on('error', (error) => {
        logger.info('网络异常: ', error)
        reject(error)
      })
      request.end()
    } catch (error) {
      reject(error)
      logger.error('downloadHotPackFileZip error：', error)
    }
  })
}

// 删除指定目录下的所有文件(同步方式)
function deleteFolderRecursiveSync(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        // 递归删除子文件夹
        deleteFolderRecursive(curPath)
      } else {
        // 删除文件
        fs.unlinkSync(curPath)
      }
    })
    // 删除目标文件夹
    fs.rmdirSync(folderPath)
    logger.info(`成功删除目录：${folderPath}`)
  } else {
    logger.info(`目录不存在：${folderPath}`)
  }
}
function deleteFolderRecursiveAsync(folderPath, callback) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return callback(err)
    }

    let deletedCount = 0
    const totalFiles = files.length

    if (totalFiles === 0) {
      fs.rmdir(folderPath, callback)
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file)

      fs.lstat(filePath, (err, stats) => {
        if (err) {
          return callback(err)
        }

        if (stats.isDirectory()) {
          deleteFolderRecursiveAsync(filePath, (err) => {
            if (err) {
              return callback(err)
            }

            deletedCount++
            if (deletedCount === totalFiles) {
              fs.rmdir(folderPath, callback)
            }
          })
        } else {
          fs.unlink(filePath, (err) => {
            if (err) {
              return callback(err)
            }

            deletedCount++
            if (deletedCount === totalFiles) {
              fs.rmdir(folderPath, callback)
            }
          })
        }
      })
    })
  })
}

// 备份指定目录下的所有文件（同步方式）
function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target)
  }

  if (fs.lstatSync(source).isDirectory()) {
    fs.readdirSync(source).forEach((file) => {
      const sourcePath = path.join(source, file)
      const targetPath = path.join(target, file)

      if (fs.lstatSync(sourcePath).isDirectory()) {
        // 递归复制子文件夹
        copyFolderRecursive(sourcePath, targetPath)
      } else {
        // 复制文件
        fs.copyFileSync(sourcePath, targetPath)
      }
    })
  }
}
function copyFolderRecursiveAsync(source, target, callback) {
  fs.mkdir(target, { recursive: true }, (err) => {
    if (err) {
      return callback(err)
    }

    fs.readdir(source, { withFileTypes: true }, (err, files) => {
      if (err) {
        return callback(err)
      }

      const copyFilePromises = files.map((file) => {
        const sourcePath = path.join(source, file.name)
        const targetPath = path.join(target, file.name)

        if (file.isDirectory()) {
          return new Promise((resolve, reject) => {
            copyFolderRecursiveAsync(sourcePath, targetPath, (err) => {
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            })
          })
        } else {
          return new Promise((resolve, reject) => {
            copyFile(sourcePath, targetPath, (err) => {
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            })
          })
        }
      })

      Promise.all(copyFilePromises)
        .then(() => callback(null))
        .catch(callback)
    })
  })
}

function copyFile(source, target, callback) {
  const readStream = fs.createReadStream(source)
  const writeStream = fs.createWriteStream(target)

  readStream.on('error', callback)
  writeStream.on('error', callback)

  writeStream.on('finish', callback)

  readStream.pipe(writeStream)
}

async function checkPatckUpdate() {
  try {
    const remoteVersion = await getRemotePatchVersion()
    const curVersion = await getCurrrentPatchVersion()
    logger.info('patchUpdate curVersion：', curVersion)
    logger.info('patchUpdate remoteVersion：', remoteVersion)

    const resourcePath = `${getAppExeDir()}/resources/`
    const unpatchZipPath = resourcePath + 'unpatch.zip'
    const appPath = resourcePath + 'app.asar.unpacked'
    const appOldPath = resourcePath + 'app.asar.unpacked.old'

    logger.info('patchUpdate resourcePath：', resourcePath)
    logger.info('patchUpdate unpatchZipPath：', unpatchZipPath)
    logger.info('patchUpdate appPath：', appPath)
    logger.info('patchUpdate appOldPath：', appOldPath)

    logger.info(`currentVersion：${curVersion},latestVersion：${remoteVersion}`)
    if (curVersion != remoteVersion) {
      sendPatchUpdateMsg({ status: 'start' })
      await downloadHotPackFileZip(unpatchZipPath)
      if (isDirectoryExists(appOldPath)) {
        logger.info('存在旧备份文件')
        deleteFolderRecursiveAsync(appOldPath, (er) => {
          if (er) {
            logger.error('删除旧备份文件出错', er)
            sendPatchUpdateMsg({ status: 'error', msg: '删除旧备份文件出错' + er })
            return
          }
          logger.info('删除旧备份文件完成')
          doUpdatePatch(appPath, appOldPath, unpatchZipPath, remoteVersion)
        })
      } else {
        logger.info('不存在旧备份文件')
        doUpdatePatch(appPath, appOldPath, unpatchZipPath, remoteVersion)
      }
    }
  } catch (er) {
    logger.error('checkPatckUpdate', er)
    sendPatchUpdateMsg({ status: 'error', msg: 'checkPatckUpdate' + er })
  }
}

// 更新补丁
function doUpdatePatch(appPath, appOldPath, unpatchZipPath, remoteVersion) {
  copyFolderRecursiveAsync(appPath, appOldPath, (er) => {
    if (er) {
      logger.error('备份出错', er)
      sendPatchUpdateMsg({ status: 'error', msg: '备份出错' + er })
      return
    }
    logger.info('备份完成')
    const zip = new AdmZip(unpatchZipPath)
    zip.extractAllToAsync(appPath, true, (er) => {
      if (er) {
        logger.error('增量包解压失败：', er)
        sendPatchUpdateMsg({ status: 'error', msg: '增量包解压失败：' + er })
        // 恢复备份
        fs.rename(appOldPath, appPath, (er) => {
          logger.error('恢复备份失败：', er)
          sendPatchUpdateMsg({ status: 'error', msg: '恢复备份失败：' + er })
        })
        return
      }
      logger.info('增量包解压完成')
      // 更新本地hotVersion的版本号
      const hotVerPath = `${getAppExeDir()}/resources/hotVersion.json`
      fs.writeFile(
        hotVerPath,
        JSON.stringify(
          {
            version: remoteVersion,
          },
          null,
          2,
        ),
        (er) => {
          if (er) {
            logger.error('更新本地hotVersion的版本号失败：', er)
            sendPatchUpdateMsg({ status: 'error', msg: '更新本地hotVersion的版本号失败：' + er })
            return
          }
          logger.info('更新本地hotVersion的版本号完成')
          sendPatchUpdateMsg({ status: 'success' })
        },
      )
    })
  })
}

function sendPatchUpdateMsg(data) {
  mainWin.webContents.send('patchUpdateMessage', data)
}

module.exports = {
  initAppUpdate,
  checkPatckUpdate,
}
