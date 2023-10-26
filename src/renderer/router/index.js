import Vue from 'vue'
import Router from 'vue-router'

import LayoutIndex from '../views/layout/Index' // 首页
import Index from '../views/home/Index' // 首页
import Error from '../views/Error' // 404

Vue.use(Router)

// webpack导入各个模块的路由
const requireRouteFilePaths = require.context('./', true, /^.\/.*\/.*\.js$/)
const otherRoutes = requireRouteFilePaths
  .keys()
  .map((routeFilePath) => requireRouteFilePaths(routeFilePath)['default'])
  .reduce((prev, next) => prev.concat(next))

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'root',
      component: LayoutIndex,
      redirect: { path: '/tool/fileCopy' },
      children: [...otherRoutes],
    },
    {
      path: '*',
      name: '404',
      component: Error,
      meta: { title: '404' },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
})

// 全局前置导航守卫
router.beforeEach(async (to, from, next) => {
  const title = to.meta.title

  if (title) {
    document.title = title
  }

  next()
})

export default router
