const FileCopy = () => import(/* webpackChunkName: "tool" */ '../../views/tool/FileCopy')

export default [
  {
    path: '/tool/fileCopy',
    name: 'FileCopy',
    component: FileCopy,
    meta: { title: '文件拷贝' },
  },
]
