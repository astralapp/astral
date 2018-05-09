<template>
  <modal name="settings-modal">
    <div class="flex items-center justify-between px-4 py-6">
      <h3>Settings</h3>
      <button
        class="text-2xl focus-none"
        @click="closeModal">&times;</button>
    </div>
    <div class="px-4 py-6 bg-grey-lightest border-t border-b border-grey-light flex justify-between items-center">
      <span class="leading-normal">Subscribe to Updates</span>
      <div class="relative toggle-switch">
        <input
          type="email"
          placeholder="you@example.com"
          class="text-input w-64">
      </div>
    </div>
    <div class="px-4 py-6 bg-white border-b border-grey-light flex justify-between items-center">
      <span class="leading-normal">Show Language Tags on Stars</span>
      <toggle-switch v-model="settings.showLanguageTags"/>
    </div>
    <div class="px-4 py-6 bg-white border-b border-grey-light flex justify-between items-center">
      <span class="leading-normal">Delete All User Data</span>
      <button
        :class="[ settings.deleteUserClicked ? 'btn-danger' : 'border-red' ]"
        class="btn text-sm py-1 px-3"
        @click="deleteUserButtonClicked">{{ settings.deleteUserClicked ? 'Delete Forever!' : 'Are you sure?' }}</button>
    </div>
  </modal>
</template>
<script>
import { mapActions } from 'vuex'
import ToggleSwitch from '@/components/ToggleSwitch'
export default {
  name: 'SettingsModal',
  components: {
    ToggleSwitch
  },
  props: ['user'],
  data () {
    return {
      settings: {
        showLanguageTags: false,
        deleteUserClicked: false
      }
    }
  },
  methods: {
    ...mapActions(['deleteUser']),
    closeModal () {
      this.$modal.hide('settings-modal')
    },
    deleteUserButtonClicked () {
      if (this.settings.deleteUserClicked) {
        this.deleteUser(this.user.id)
      }
      this.settings.deleteUserClicked = !this.settings.deleteUserClicked
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
