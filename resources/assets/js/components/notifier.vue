<template>
  <transition name="dashboard-notifier">
    <div :class="'dashboard-notifier dashboard-notifier-' + mode" v-show="show">
      <div class="dashboard-notifierInner">
        <div class="dashboard-notifierMessage">
        {{ message }}
        </div>
        <div class="dashboard-dismissNotifier" @click="hideNotifier()">&times;</div>
      </div>
    </div>
  </transition>
</template>
<script>
import Vue from 'vue'
export default {
  name: 'Notifier',
  props: ['timeout'],
  data () {
    return {
      _timeout: null,
      show: false,
      mode: 'success',
      message: ''
    }
  },
  created () {
    this.$bus.$on('NOTIFICATION', (message, mode = 'success', duration = '3000') => {
      this.message = message
      this.mode = mode
      Vue.nextTick(() => {
        this.showNotifier(duration)
      })
    })
  },
  methods: {
    showNotifier (duration = 3000) {
      this.show = true
      clearTimeout(this._timeout)
      this._timeout = setTimeout(() => {
        this.show = false
      }, parseInt(duration, 10) + 500)
    },
    hideNotifier () {
      clearTimeout(this._timeout)
      this.show = false
    }
  }
}
</script>
