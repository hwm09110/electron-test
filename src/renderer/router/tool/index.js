const FileCopy = () => import(/* webpackChunkName: "tool" */ '../../views/tool/FileCopy')
const AppInfo = () => import(/* webpackChunkName: "tool" */ '../../views/tool/AppInfo')
const Readme = () => import(/* webpackChunkName: "tool" */ '../../views/tool/Readme')

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
  {
    path: '/tool/readme',
    name: 'Readme',
    component: Readme,
    meta: { title: 'Readme' },
  },
]
