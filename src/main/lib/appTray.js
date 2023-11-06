/* 系统托盘 */
const { Menu, Tray, app } = require('electron')
const path = require('path')
const pkg = require('../../../package.json')
// 注意这里是全局定义这个隐藏到系统托盘变量，不然下面 new Tray 会报错

module.exports = function initAppTray(win) {
  let tray = null

  /* 托盘图标地址 */
  const exeDirName = path.dirname(app.getPath('exe')).replace('/\\/g', '/')
  const file_path = `${
    process.env.NODE_ENV == 'development'
      ? path.join(__dirname, '../../public/icons/favicon.png')
      : path.join(exeDirName, '/resources/public/icons/favicon.png')
  }`

  // 当我们点击关闭时触发close事件，我们按照之前的思路在关闭时，隐藏窗口，隐藏任务栏窗口
  // event.preventDefault(); 禁止关闭行为(非常必要，因为我们并不是想要关闭窗口，所以需要禁止默认行为)
  win.on('close', (event) => {
    win.hide()
    win.setSkipTaskbar(true)
    event.preventDefault()
  })
  tray = new Tray(file_path)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      click: () => {
        win.destroy()
      },
    }, //我们需要在这里有一个真正的退出（这里直接强制退出）
  ])
  tray.setToolTip(pkg.name)
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
    win.isVisible() ? win.hide() : win.show()
    win.isVisible() ? win.setSkipTaskbar(false) : win.setSkipTaskbar(true)
  })
}
