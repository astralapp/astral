<template>
  <VueModal name="settings-modal" height="auto">
    <div class="flex items-center justify-between px-4 py-3 bg-grey-lightest leading-none">
      <h3>Settings</h3>
      <button
        class="text-2xl focus-none rounded-full w-8 h-8 bg-transparent indent-px hover:bg-grey-light transition-bg"
        @click="closeModal"
      >
        &times;
      </button>
    </div>
    <div class="px-4 py-6 bg-white border-b border-t border-grey-light flex justify-between items-center">
      <span class="leading-normal">
        Show Language Tags on Stars
      </span>
      <ToggleSwitch v-model="user.show_language_tags" @change="setShowLanguageTags(user.show_language_tags)" />
    </div>
    <div class="px-4 py-6 bg-white border-b border-grey-light flex justify-between items-center">
      <span class="leading-normal">
        Auto-Save Notes
      </span>
      <ToggleSwitch v-model="user.autosave_notes" @change="setAutosaveNotes(user.autosave_notes)" />
    </div>
    <div class="px-4 py-6 bg-white border-b border-grey-light flex justify-between">
      <span class="leading-normal">
        Export Stars As JSON
      </span>
      <a :href="exportUrl" target="_blank" rel="noopener" class="btn btn-grey">
        Export
      </a>
    </div>
    <div class="px-4 py-6 bg-white border-b border-grey-light">
      <div class="flex justify-between items-center">
        <span class="leading-normal">
          GitHub Access
        </span>
        <div>
          <button class="btn text-sm py-2 px-4 btn-danger ml-2" @click="revokeAccessButtonClicked">
            Revoke Access
          </button>
        </div>
      </div>
      <div class="flex justify-end mt-6">
        <p class="text-sm text-grey-darker">
          This will log you out and revoke your authorization granted to Astral for accessing your GitHub account. You
          will not lose any data.
        </p>
      </div>
    </div>
    <div class="px-4 py-6 bg-white">
      <div class="flex justify-between items-center">
        <span class="leading-normal">
          Delete Account
        </span>
        <div>
          <input
            v-show="deleteUserClicked"
            v-model="deleteConfirmation"
            type="text"
            placeholder="Enter your username to confirm"
            class="text-input text-sm px-2 w-64"
          />
          <button
            :disabled="deleteButtonDisabled"
            class="btn text-sm py-2 px-4 btn-danger ml-2"
            @click="deleteUserButtonClicked"
          >
            {{ deleteUserClicked ? 'Confirm Deletion' : 'Delete My Account' }}
          </button>
        </div>
      </div>
      <div v-show="deleteUserClicked" class="flex justify-end mt-6">
        <p class="text-sm text-red-light">
          This will permanently delete all of your data. Be careful!
        </p>
      </div>
    </div>
  </VueModal>
</template>
<script>
import { mapActions } from 'vuex'
import ToggleSwitch from '@/components/ToggleSwitch'
export default {
  name: 'SettingsModal',
  components: {
    ToggleSwitch
  },
  props: {
    user: Object
  },
  data() {
    return {
      deleteUserClicked: false,
      deleteConfirmation: '',
      exportUrl: `/api/stars/export`
    }
  },
  computed: {
    deleteButtonDisabled() {
      return this.deleteUserClicked && this.deleteConfirmation.trim() !== this.user.username
    }
  },
  methods: {
    ...mapActions(['deleteUser', 'setShowLanguageTags', 'setAutosaveNotes', 'revokeUserAccess']),
    closeModal() {
      this.$modal.hide('settings-modal')
    },
    async deleteUserButtonClicked() {
      if (this.deleteUserClicked) {
        await this.deleteUser()
        this.$router.push('auth/logout')
      }
      this.deleteUserClicked = !this.deleteUserClicked
    },
    async revokeAccessButtonClicked() {
      await this.revokeUserAccess()
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
