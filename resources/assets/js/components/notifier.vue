<template>
  <div :class="'dashboard-notifier dashboard-notifier-' + mode" v-show="show" transition="dashboard-notifier">
    <div class="dashboard-notifierInner">
      <div class="dashboard-notifierMessage">
      {{ message }}
      </div>
      <div class="dashboard-dismissNotifier" @click="hideNotifier()">&times;</div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Notifier",
  props: ["timeout"],
  data () {
    return {
      _timeout: null,
      show: false,
      mode: "success",
      message: ""
    }
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
  },
  events: {
    "NOTIFICATION": function (message, mode = "success", duration = 3000) {
      this.message = message
      this.mode = mode
      this.showNotifier(duration)
    }
  }
}
</script>
