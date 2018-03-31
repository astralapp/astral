<template>
  <modal name="settings-modal">
    <div class="flex items-center justify-between px-4 py-6">
      <h3>Settings</h3>
      <button class="text-2xl focus-none" @click="closeModal">&times;</button>
    </div>
    <div class="px-4 py-6 bg-grey-lightest border-t border-b border-grey-light flex justify-between items-center">
      <span class="leading-normal">Your email (optional)</span>
      <div class="relative toggle-switch">
        <input type="email" placeholder="you@example.com" class="text-grey-darkest border-2 border-grey-light focus:border-grey rounded py-2 px-4 w-64 focus-none appearance-none transition-border-color" />
      </div>
    </div>
    <div class="px-4 py-6 bg-white border-b border-grey-light flex justify-between items-center">
      <span class="leading-normal">Show Language Tags on Stars</span>
      <div class="relative toggle-switch">
        <input type="checkbox" id="languageTags" class="absolute invisible" />
        <label for="languageTags" class="relative block rounded-full h-6 w-12 bg-grey-light cursor-pointer transition-bg"></label>
      </div>
    </div>
  </modal>
</template>
<script>
export default {
  name: 'SettingsModal',
  props: ['user'],
  methods: {
    closeModal() {
      this.$modal.hide('settings-modal')
    }
  }
}
</script>
<style lang="scss" scoped>
.toggle-switch {
  label {
    &::before {
      transition: transform 150ms ease-in-out;
      content: '';
      display: block;
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: config('colors.grey-lightest');
      transform: translate3d(0, 0, 0);
    }
  }
  input:checked + label {
    background: config('colors.brand');
    &::before {
      transform: translate3d(24px, 0, 0);
    }
  }
}
</style>

