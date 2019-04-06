import Vue from 'vue'
import Router from 'vue-router'
import ls from 'local-storage'
import Auth from '@/components/Auth/Index'
import Dashboard from '@/components/Dashboard/Index'

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
            ls.clear()
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
    ls.clear()
    next('auth')
  } else if (!requiresAuth && token) {
    next('dashboard')
  } else {
    next()
  }
})

export default router
