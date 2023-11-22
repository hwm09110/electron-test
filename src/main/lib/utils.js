const path = require('path')
const fs = require('fs')
const { app } = require('electron')

// 获取应用可执行文件exe所在目录
function getAppExeDir() {
  return path.dirname(app.getPath('exe')).replace('/\\/g', '/')
}

// 判断目录是否存在
function isDirectoryExists(directoryPath) {
  return fs.existsSync(directoryPath) && fs.statSync(directoryPath).isDirectory()
}

module.exports = {
  getAppExeDir,
  isDirectoryExists,
}
