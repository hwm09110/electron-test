const path = require('path')
const AdmZip = require('adm-zip')
const fs = require('fs')

exports.default = async function (context) {
  let targetPath
  if (context.packager.platform.nodeName === 'darwin') {
    targetPath = path.join(
      context.appOutDir,
      `${context.packager.appInfo.productName}.app/Contents/Resources`,
    )
  } else {
    targetPath = path.join(context.appOutDir, './resources')
  }
  const unpacked = path.join(targetPath, './app/dist/electron/renderer')
  var zip = new AdmZip()
  zip.addLocalFolder(unpacked)
  zip.writeZip(path.join(context.outDir, 'renderer.zip'))

  fs.writeFile(
    path.join(context.outDir, 'hotVersion.json'),
    JSON.stringify(
      {
        version: require('../hotVersion.json').version,
      },
      null,
      2,
    ),
    (err) => {},
  )
}
