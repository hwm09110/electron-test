# electron-demo

### 注意

```bash
# 开发
npm run dev

# 打包
npm run build
```

TIP：打包使用 npm，不用用 yarn

### 发布配置

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

### 版本更新

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
