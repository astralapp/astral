<template>
  <Transition name="dashboard-notifier">
    <div
      v-show="show"
      :class="mode === 'success' ? 'bg-brand' : 'bg-red-dark'"
      class="dashboard-notifier fixed pin-r pin-b mr-4 mb-4 rounded p-4"
    >
      <div class="flex items-center">
        <div class="flex-grow text-white">
          {{ message }}
        </div>
        <div
          :class="mode === 'success' ? 'text-green-darker' : 'text-red-darker'"
          class="text-xl cursor-pointer ml-3"
          @click="hideNotifier()"
        >
          <span>&times;</span>
        </div>
      </div>
    </div>
  </Transition>
</template>
<script>
export default {
  name: 'Notifier',
  props: ['timeout'],
  data() {
    return {
      timer: null,
      show: false,
      mode: 'success',
      message: ''
    }
  },
  created() {
    this.$bus.$on('NOTIFICATION', (message, mode = 'success', duration = '3000') => {
      this.message = message
      this.mode = mode
      this.$nextTick(() => {
        this.showNotifier(duration)
      })
    })
  },
  methods: {
    showNotifier(duration = 3000) {
      this.show = true
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.show = false
      }, parseInt(duration, 10) + 500)
    },
    hideNotifier() {
      clearTimeout(this.timer)
      this.show = false
    }
  }
}
</script>
<style lang="scss">
.dashboard-notifier {
  position: fixed;
  width: 280px;
  z-index: 99999;
  &-enter-active,
  &-leave-active {
    transition: transform 250ms cubic-bezier(0.215, 0.61, 0.355, 1),
      opacity 250ms cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  &-enter,
  &-leave-to {
    transform: translate3d(40px, 0, 0);
    opacity: 0;
  }
}
</style>
