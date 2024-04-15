<script setup lang="ts">
import BaseButton from '@/components/shared/core/BaseButton.vue'
import BaseDialog from '@/components/shared/core/BaseDialog.vue'
import BaseTextInput from '@/components/shared/core/BaseTextInput.vue'
import BaseToggle from '@/components/shared/core/BaseToggle.vue'
import SettingsSidebar from '@/components/shared/dialogs/SettingsDialog/SettingsSidebar.vue'
import { useAuth } from '@/composables/use-auth'
import { useSettingsDialog } from '@/composables/useSettingsDialog'
import { useUserStore } from '@/store/useUserStore'
import { SettingsTab } from '@/types'
import { DialogTitle } from '@headlessui/vue'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/solid'
import { router } from 'hybridly'
import { computed, nextTick, ref } from 'vue'
import ConfettiExplosion from 'vue-confetti-explosion'

const { user } = useAuth()
const { isOpen, hide } = useSettingsDialog()
const userStore = useUserStore()

const activeTab = ref<SettingsTab>('general')

const isRequestingDeleteConfirmation = ref(false)
const usernameConfirmation = ref('')
const confirmInput = ref<null | typeof BaseTextInput>()

const openAiForm = useForm({
  fields: {
    openai_token: user.value?.openaiToken ?? '',
  },
  method: 'PUT',
  only: ['user'],
  reset: false,
  timeout: 1500,
  url: route('openai-token.update'),
})

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
  isSponsor.value = true
}
</script>

<template>
  <BaseDialog
    :is-open="isOpen"
    :hide="hide"
    dialog-classes="sm:max-w-[740px] px-0 pt-0 pb-0 sm:p-0 sm:pb-4 sm:h-[560px]"
  >
    <DialogTitle
      class="w-full rounded-t-lg border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 py-4 px-5 text-xl font-bold text-gray-700 dark:text-gray-200"
      >Settings</DialogTitle
    >

    <div class="flex items-start gap-x-4">
      <SettingsSidebar
        :active-tab="activeTab"
        @tab-selected="activeTab = $event"
      />

      <div class="divide-y divide-gray-100 dark:divide-gray-700">
        <template v-if="activeTab === 'general'">
          <div class="px-4 py-5">
            <div class="flex items-center">
              <div>
                <p class="font-bold text-gray-600 dark:text-gray-300 text-sm">Sponsorship status</p>

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
                    class="text-sm font-bold text-yellow-600 dark:text-yellow-500"
                  >
                    Not sponsoring.
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
              <p class="font-bold text-gray-600 dark:text-gray-300 text-sm">Show language tags</p>

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
              <p class="font-bold text-gray-600 dark:text-gray-300 text-sm">Auto-save notes</p>

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
            <div class="flex items-center gap-x-6">
              <p class="font-bold text-gray-600 dark:text-gray-300 text-sm flex-shrink-0">OpenAI token</p>

              <form
                class="ml-auto flex items-center gap-x-2 w-full"
                @submit.prevent="openAiForm.submit"
              >
                <BaseTextInput
                  class="w-full"
                  v-model="openAiForm.fields.openai_token"
                  type="password"
                />

                <BaseButton
                  kind="primary"
                  type="submit"
                  size="sm"
                  :disabled="openAiForm.processing || openAiForm.recentlySuccessful"
                  >{{ openAiForm.recentlySuccessful ? 'Saved' : openAiForm.processing ? 'Saving' : 'Save' }}</BaseButton
                >
              </form>
            </div>

            <p class="mt-4 w-2/3 text-sm text-gray-500 dark:text-gray-300">
              Enables various AI-powered features, such as auto-generated notes and suggested tags.
            </p>
          </div>
        </template>

        <template v-if="activeTab === 'data-controls'">
          <div class="px-4 py-5">
            <div class="flex items-center">
              <p class="font-bold text-gray-600 dark:text-gray-300 text-sm">GitHub access</p>

              <BaseButton
                class="ml-auto"
                kind="danger"
                size="sm"
                @click="router.post('/revoke-grant')"
                >Revoke access</BaseButton
              >
            </div>

            <p class="mt-4 w-2/3 text-sm text-gray-500 dark:text-gray-300">
              This will log you out and revoke your authorization granted to Astral for accessing your GitHub account.
              You will not lose any data.
            </p>
          </div>

          <div class="px-4 py-5">
            <div class="flex items-center">
              <p class="font-bold text-gray-600 dark:text-gray-300 text-sm">Delete account</p>

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
        </template>
      </div>
    </div>
  </BaseDialog>
</template>
