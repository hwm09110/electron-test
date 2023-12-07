# electron-demo

## 开发构建 🎃

```bash
# 开发
yarn dev

# 打包
yarn build:app
```

TIP：打包使用 npm，不用用 yarn

## 发布配置 🎁

方式 1： package.json

```
"publish": [
      {
        "provider": "generic",
        "url": "http://192.168.8.172:3600/resource/app/pack/"
      }
    ]

或者

"publish": [
      {
        "provider": "github",
        "owner": "hwm09110",
        "repo": "electron-test"
      }
    ]
```

方式 2：配置 electron-builder.yml

```

# provider: 'github'
# owner: 'hwm09110'
# repo: 'electron-test'

或者

provider: 'generic'
url: 'http://192.168.8.172:3600/resource/app/pack/'

```

## 版本更新 🎈

1.全量更新

```json
修改package.json下面的version
{
  "version":"0.0.2"
}
git tag 跟version相同
```

2.增量更新（只更新 web）

```json
只修改hotVersion.json下面的version
{
  "version":"0.0.2"
}
```

## 注意事项 💡

问题 1. 使用 bytenode 加密打包主进程文件成功后,运行应用大概率 Invalid or incompatible cached data (cachedDataRejected)

```
处理方法：
1.检查node版本与electron内置的node版本是否一致(好像不一致也ok)
2.检查打包电脑的系统版本与打包配置的系统版本是否一致(重点检查)
可以参考 https://github.com/bytenode/bytenode/issues/164
```

问题 2. 使用 electron-builder 打包过程遇到下载超时报错

```
处理方法：修改镜像源
registry=https://registry.npm.taobao.org/
electron_mirror=https://npm.taobao.org/mirrors/electron/

yarn config set registry https://registry.npmmirror.com/
yarn config set electron_mirror https://npm.taobao.org/mirrors/electron/
```

## 其他 🎃

1. 打包使用 asar 模式, 如果要分离主进程与渲染进程文件，只更更新渲染进程文件，可按如下处理：

```
package.json下面build field 加上
"asarUnpack": [
  "**/renderer/**/*",
  "**/node_modules/**/*",
  "**/package.json"
],
"afterPack": "./build/afterpack.js",

```

项目根目录下新增 hotVersion.json

```json
{
  "version": "0.0.1"
}
```

新增 afterpack.js

```javascript
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
  const unpacked = path.join(targetPath, './app.asar.unpacked')
  var zip = new AdmZip()
  zip.addLocalFolder(unpacked)
  zip.writeZip(path.join(context.outDir, 'unpacked.zip'))

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
```

main.js 改动

```javascript
const exeDirName = path.dirname(app.getPath('exe')).replace('/\\/g', '/')
winURL = `file://${exeDirName}/resources/app.asar.unpacked/dist/renderer/index.html`
mainWindow.loadURL(winURL)
```
