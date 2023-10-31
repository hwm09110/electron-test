const FileCopy = () => import(/* webpackChunkName: "tool" */ '../../views/tool/FileCopy')
const AppInfo = () => import(/* webpackChunkName: "tool" */ '../../views/tool/AppInfo')

export default [
  {
    path: '/tool/fileCopy',
    name: 'FileCopy',
    component: FileCopy,
    meta: { title: '文件拷贝' },
  },
  {
    path: '/tool/appInfo',
    name: 'AppInfo',
    component: AppInfo,
    meta: { title: '应用信息' },
  },
]
