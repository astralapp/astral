<template>
  <modal
    name="settings-modal"
    height="auto">
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
    <div class="px-4 py-6 bg-white border-b border-grey-light">
      <div class="flex justify-between items-center mb-4">
        <span class="leading-normal">Delete Account</span>
        <div>
          <input
            v-show="deleteUserClicked"
            v-model="deleteConfirmation"
            type="text"
            placeholder="Enter your username to confirm"
            class="text-input text-sm px-2 w-64">
          <button
            :disabled="deleteButtonDisabled"
            class="btn text-sm py-2 px-4 btn-danger ml-2"
            @click="deleteUserButtonClicked">{{ deleteUserClicked ? 'Confirm Deletion' : 'Delete My Account' }}</button>
        </div>
      </div>
      <div class="flex justify-between items-center mt-2">
        <p class="text-sm text-red-light">This will permanently delete all of your data. Be careful!</p>
      </div>
    </div>
    <div class="px-4 py-6 bg-white border-b border-grey-light flex justify-between">
      <span class="leading-normal">Export Stars As JSON</span>
      <a
        :href="exportUrl"
        target="_blank"
        rel="noopener"
        class="btn text-sm py-2 px-4 btn-flat ml-2 no-underline text-grey">Export</a>
    </div>
  </modal>
</template>
<script>
import { mapActions } from 'vuex'
import ls from 'local-storage'
import ToggleSwitch from '@/components/ToggleSwitch'
export default {
  name: 'SettingsModal',
  components: {
    ToggleSwitch
  },
  props: ['user'],
  data () {
    return {
      deleteUserClicked: false,
      deleteConfirmation: '',
      settings: {
        showLanguageTags: false
      },
      exportUrl: `/api/stars/export?token=${ls('jwt')}`
    }
  },
  computed: {
    deleteButtonDisabled () {
      return (this.deleteUserClicked && this.deleteConfirmation.trim() !== this.user.username)
    }
  },
  methods: {
    ...mapActions(['deleteUser']),
    closeModal () {
      this.$modal.hide('settings-modal')
    },
    deleteUserButtonClicked () {
      if (this.deleteUserClicked) {
        this.deleteUser(this.user.id).then(() => {
          this.$router.push('auth/logout')
        })
      }
      this.deleteUserClicked = !this.settings.deleteUserClicked
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
