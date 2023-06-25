<script setup lang="ts">
import BaseButton from '@/components/shared/core/BaseButton.vue'
import BaseDialog from '@/components/shared/core/BaseDialog.vue'
import BaseTextInput from '@/components/shared/core/BaseTextInput.vue'
import BaseToggle from '@/components/shared/core/BaseToggle.vue'
import { useAuth } from '@/composables/use-auth'
import { useSettingsDialog } from '@/composables/useSettingsDialog'
import { useUserStore } from '@/store/useUserStore'
import { DialogTitle } from '@headlessui/vue'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/solid'
import { router } from 'hybridly'
import { computed, nextTick, ref } from 'vue'
import ConfettiExplosion from 'vue-confetti-explosion'

const { user } = useAuth()
const { isOpen, hide } = useSettingsDialog()
const userStore = useUserStore()
const isRequestingDeleteConfirmation = ref(false)
const usernameConfirmation = ref('')
const confirmInput = ref<null | typeof BaseTextInput>()

const deleteButtonLabel = computed(() =>
  isRequestingDeleteConfirmation.value ? 'Confirm deletion' : 'Delete my account'
)

const deleteButtonIsDisabled = computed(() => {
  return isRequestingDeleteConfirmation.value && usernameConfirmation.value !== user.value?.username
})

const updateUserSetting = (setting: string, enabled: boolean) => {
  router.put(route('settings.update'), {
    data: {
      enabled,
      key: setting,
    },
    only: ['user'],
  })
}

const deleteUser = async () => {
  if (!isRequestingDeleteConfirmation.value) {
    isRequestingDeleteConfirmation.value = true
    await nextTick()
    confirmInput.value?.$el.focus()
  } else {
    userStore.deleteUser()
  }
}

const isSponsor = ref(false)
const checkSponsorshipStatus = () => {
  const result = Boolean(Math.floor(Math.random() * 2))
  isSponsor.value = true
}
</script>

<template>
  <BaseDialog
    :is-open="isOpen"
    :hide="hide"
    dialog-classes="sm:max-w-xl px-0 pt-0 pb-0 sm:p-0"
  >
    <DialogTitle
      class="w-full rounded-t-lg border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 p-4 text-xl font-bold text-gray-700 dark:text-gray-200"
      >Settings</DialogTitle
    >

    <div class="divide-y divide-gray-100 dark:divide-gray-700">
      <div class="px-4 py-5">
        <div class="flex items-center">
          <div>
            <p class="font-bold text-gray-600 dark:text-gray-300">Sponsorship status</p>

            <div class="mt-2">
              <p
                v-show="isSponsor"
                class="flex items-center gap-x-1"
              >
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-green-200 dark:text-green-950"
                >
                  <CheckCircleIcon class="h-5 w-5" />
                </span>

                <span class="text-sm font-bold text-green-800 dark:text-green-500"
                  >You're a sponsor and you're awesome!</span
                >
              </p>

              <p
                v-show="!isSponsor"
                class="flex items-center gap-x-1"
              >
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-yellow-200 dark:text-yellow-950"
                >
                  <XCircleIcon class="h-5 w-5" />
                </span>

                <span class="text-sm font-bold text-yellow-600 dark:text-yellow-500">Not sponsoring.</span>
              </p>
            </div>
          </div>

          <BaseButton
            class="ml-auto"
            kind="primary"
            size="sm"
            @click="checkSponsorshipStatus"
            >Check now</BaseButton
          >

          <ConfettiExplosion v-if="isSponsor" />
        </div>
      </div>

      <div class="px-4 py-5">
        <div class="flex items-center">
          <p class="font-bold text-gray-600 dark:text-gray-300">Show language tags</p>

          <BaseToggle
            class="ml-auto"
            :enabled="user?.settings.show_language_tags"
            @change="updateUserSetting('show_language_tags', !!$event)"
          />
        </div>

        <p class="mt-4 w-2/3 text-sm text-gray-500 dark:text-gray-300">
          Shows or hides the language tag on repos in your list.
        </p>
      </div>

      <div class="px-4 py-5">
        <div class="flex items-center">
          <p class="font-bold text-gray-600 dark:text-gray-300">Auto-save notes</p>

          <BaseToggle
            class="ml-auto"
            :enabled="user?.settings.autosave_notes"
            @change="updateUserSetting('autosave_notes', !!$event)"
          />
        </div>

        <p class="mt-4 w-2/3 text-sm text-gray-500 dark:text-gray-300">
          While this is turned on, notes will auto-save every few seconds as you type.
        </p>
      </div>

      <div class="px-4 py-5">
        <div class="flex items-center">
          <p class="font-bold text-gray-600 dark:text-gray-300">GitHub access</p>

          <BaseButton
            class="ml-auto"
            kind="danger"
            size="sm"
            @click="router.post('/revoke-grant')"
            >Revoke access</BaseButton
          >
        </div>

        <p class="mt-4 w-2/3 text-sm text-gray-500 dark:text-gray-300">
          This will log you out and revoke your authorization granted to Astral for accessing your GitHub account. You
          will not lose any data.
        </p>
      </div>

      <div class="px-4 py-5">
        <div class="flex items-center">
          <p class="font-bold text-gray-600 dark:text-gray-300">Delete account</p>

          <div class="ml-auto flex items-center space-x-3">
            <div v-show="isRequestingDeleteConfirmation">
              <label
                for="confirm-user-delete"
                class="sr-only"
                >Enter your username to confirm</label
              >

              <BaseTextInput
                id="confirm-user-delete"
                ref="confirmInput"
                v-model="usernameConfirmation"
                placeholder="Enter your username to confirm"
                class="w-60"
              />
            </div>

            <BaseButton
              kind="danger"
              size="sm"
              :disabled="deleteButtonIsDisabled"
              @click="deleteUser"
              >{{ deleteButtonLabel }}</BaseButton
            >
          </div>
        </div>

        <p class="mt-4 w-2/3 text-sm text-gray-500 dark:text-gray-300">
          This will permanently delete <strong>all</strong> of your data on this site, and revoke your authorization
          granted to Astral.
          <em>Be careful!</em>
        </p>
      </div>
    </div>
  </BaseDialog>
</template>
