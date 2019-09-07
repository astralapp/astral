import Vue from 'vue'
import Router from 'vue-router'
import Auth from '@/components/auth/Index'
import Dashboard from '@/components/dashboard/Index'
import axios from 'axios'

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
      component: Auth
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

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth) {
    try {
      await axios.get('/api/auth/me')
      next()
    } catch (e) {
      next('auth')
    }
  } else {
    next()
  }
})

export default router
