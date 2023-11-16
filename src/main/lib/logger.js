// 日志
const logger = require('electron-log')
const { app } = require('electron')

logger.transports.file.level = 'debug'
logger.transports.file.maxSize = 1002430 // 最大不超过10M
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}]{scope} {text}' // 设置文件内容格式
let date = new Date()
let dateStr =
  date.getFullYear() + '-' + patchZero(date.getMonth() + 1) + '-' + patchZero(date.getDate())
logger.transports.file.fileName = dateStr + '.log' // 创建文件名格式为 '时间.log' (2023-02-01.log)

// 可以将文件放置到指定文件夹中，例如放到安装包文件夹中
const path = require('path')
const exePath = path.dirname(app.getPath('exe')) // 获取到安装目录的文件夹名称

logger.transports.file.resolvePathFn = () => `${exePath}\\log\\${dateStr}.log`

function patchZero(number) {
  return number < 10 ? '0' + number : number
}
function tranformArgs(args) {
  return args
    .map((data) => {
      return data instanceof Object ? JSON.stringify(data) : String(data)
    })
    .join(' ')
}

module.exports = {
  info(...args) {
    logger.info(tranformArgs(args))
  },
  warn(...args) {
    logger.warn(tranformArgs(args))
  },
  error(...args) {
    logger.error(tranformArgs(args))
  },
  debug(...args) {
    logger.debug(tranformArgs(args))
  },
  verbose(...args) {
    logger.verbose(tranformArgs(args))
  },
  silly(...args) {
    logger.silly(tranformArgs(args))
  },
}
