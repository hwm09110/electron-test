// 日志
const logger = require('electron-log')
const { app } = require('electron')

logger.transports.file.level = 'debug'
logger.transports.file.maxSize = 1002430 // 最大不超过10M
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}' // 设置文件内容格式
let date = new Date()
let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
logger.transports.file.fileName = dateStr + '.log' // 创建文件名格式为 '时间.log' (2023-02-01.log)

// 可以将文件放置到指定文件夹中，例如放到安装包文件夹中
const path = require('path')
const exePath = path.dirname(app.getPath('exe')) // 获取到安装目录的文件夹名称

logger.transports.file.resolvePathFn = () => `${exePath}\\log\\${dateStr}.log`

module.exports = {
  info(args) {
    logger.info(args)
  },
  warn(args) {
    logger.warn(args)
  },
  error(args) {
    logger.error(args)
  },
  debug(args) {
    logger.debug(args)
  },
  verbose(args) {
    logger.verbose(args)
  },
  silly(args) {
    logger.silly(args)
  },
}
