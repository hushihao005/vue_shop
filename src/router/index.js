import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
Vue.use(VueRouter)

const routes = [
  {
    // 路由重定向
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to表示要到哪个路径去 from代表从哪个路径跳转来
  // next是个函数 next()表示放行 next('/....')强制跳转
  if (to.path === '/login') {
    return next()
  } else {
    // 获取token值
    const token = window.sessionStorage.getItem('token')
    if (!token) { // 没有登录
      return next('/login')
    } else {
      next()
    }
  }
})

export default router
