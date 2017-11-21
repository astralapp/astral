import Vue from 'vue'
import Router from 'vue-router'
import ls from 'local-storage'
import Auth from '@/components/Auth'
// import Auth from '@/components/Auth'
// import Login from '@/components/Auth/Login'
// import Register from '@/components/Auth/Register'
// import Forgot from '@/components/Auth/Forgot'
import Dashboard from '@/components/Dashboard'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '*',
      redirect: '/auth'
    },
    {
      path: '/auth',
      name: 'Auth',
      component: Auth,
      beforeEnter: (to, from, next) => {
        if (to.query.token) {
          ls('jwt', to.query.token)
          next('dashboard')
        } else {
          next()
        }
      },
      children: [
        {
          path: 'logout',
          name: 'Logout',
          meta: {
            requiresAuth: true
          },
          beforeEnter: (to, from, next) => {
            ls.remove('jwt')
            next('auth')
          }
        }
      ]
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = ls('jwt')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !token) {
    next('auth')
  } else if (!requiresAuth && token) {
    next('dashboard')
  } else {
    next()
  }
})

export default router
