<script setup lang="ts">
import BaseButton from '@/components/shared/core/BaseButton.vue'
import BaseTextInput from '@/components/shared/core/BaseTextInput.vue'
import SettingsRow from '@/components/shared/dialogs/SettingsDialog/SettingsRow.vue'
import { useAuth } from '@/composables/use-auth'
import { useUserStore } from '@/store/useUserStore'
import axios from 'axios'
import { router } from 'hybridly'
import { computed, nextTick, ref } from 'vue'

const { user } = useAuth()
const userStore = useUserStore()

const isRequestingDeleteConfirmation = ref(false)
const usernameConfirmation = ref('')
const confirmInput = ref<InstanceType<typeof BaseTextInput> | null>(null)

const hasExtensionToken = ref(Boolean(user.value?.hasBrowserExtensionToken))
const generatedExtensionToken = ref<string | null>(null)
const isWorkingOnExtensionToken = ref(false)
const extensionTokenError = ref<string | null>(null)
const extensionTokenCopied = ref(false)

const generateExtensionToken = async () => {
  isWorkingOnExtensionToken.value = true
  extensionTokenError.value = null

  try {
    const { data } = await axios.post<{ token: string }>('/browser-extension-token')
    generatedExtensionToken.value = data.token
    hasExtensionToken.value = true
  } catch {
    extensionTokenError.value = 'Something went wrong generating your token. Please try again.'
  } finally {
    isWorkingOnExtensionToken.value = false
  }
}

const revokeExtensionToken = async () => {
  isWorkingOnExtensionToken.value = true
  extensionTokenError.value = null

  try {
    await axios.delete('/browser-extension-token')
    hasExtensionToken.value = false
    generatedExtensionToken.value = null
  } catch {
    extensionTokenError.value = 'Something went wrong revoking your token. Please try again.'
  } finally {
    isWorkingOnExtensionToken.value = false
  }
}

const copyExtensionToken = async () => {
  if (!generatedExtensionToken.value) {
    return
  }

  await navigator.clipboard.writeText(generatedExtensionToken.value)
  extensionTokenCopied.value = true
  setTimeout(() => (extensionTokenCopied.value = false), 2000)
}

const deleteButtonLabel = computed(() =>
  isRequestingDeleteConfirmation.value ? 'Confirm deletion' : 'Delete my account'
)

const deleteButtonIsDisabled = computed(
  () => isRequestingDeleteConfirmation.value && usernameConfirmation.value !== user.value?.username
)

const deleteUser = async () => {
  if (!isRequestingDeleteConfirmation.value) {
    isRequestingDeleteConfirmation.value = true
    await nextTick()
    confirmInput.value?.$el.focus()
  } else {
    userStore.deleteUser()
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-3">
      <SettingsRow
        title="Browser extension"
        description="Generate a token to connect the Astral browser extension, then paste it into the extension's settings."
      >
        <div class="flex items-center gap-2">
          <BaseButton
            kind="base"
            size="sm"
            :disabled="isWorkingOnExtensionToken"
            @click="generateExtensionToken"
            >{{ hasExtensionToken ? 'Regenerate' : 'Generate token' }}</BaseButton
          >

          <BaseButton
            v-if="hasExtensionToken"
            kind="danger-borderless"
            size="sm"
            :disabled="isWorkingOnExtensionToken"
            @click="revokeExtensionToken"
            >Revoke</BaseButton
          >
        </div>
      </SettingsRow>

      <div
        v-if="generatedExtensionToken"
        class="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200 dark:bg-gray-950/40 dark:ring-gray-800"
      >
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
          Copy this token now — for your security, it won't be shown again.
        </p>

        <div class="mt-2 flex items-center gap-2">
          <BaseTextInput
            :model-value="generatedExtensionToken"
            readonly
            class="w-full font-mono text-xs"
          />

          <BaseButton
            kind="base"
            size="sm"
            class="shrink-0"
            @click="copyExtensionToken"
            >{{ extensionTokenCopied ? 'Copied' : 'Copy' }}</BaseButton
          >
        </div>
      </div>

      <p
        v-if="extensionTokenError"
        class="text-xs font-medium text-red-600 dark:text-red-500"
      >
        {{ extensionTokenError }}
      </p>
    </div>

    <SettingsRow
      title="GitHub access"
      description="Logs you out and revokes Astral's access to your GitHub account. You won't lose any data."
    >
      <BaseButton
        kind="danger"
        size="sm"
        @click="router.post('/revoke-grant')"
        >Revoke access</BaseButton
      >
    </SettingsRow>

    <div class="rounded-lg bg-red-50 p-4 ring-1 ring-red-200 dark:bg-red-950/20 dark:ring-red-900/40 sm:p-5">
      <div class="flex items-start gap-x-3">
        <i-lucide-triangle-alert
          class="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-500"
          role="presentation"
        />

        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-red-700 dark:text-red-400">Delete account</p>

          <p class="mt-1 text-sm leading-relaxed text-red-700/80 dark:text-red-200/70">
            Permanently deletes <strong class="font-semibold">all</strong> of your data on Astral and revokes its access
            to your GitHub account. This can't be undone.
          </p>

          <form
            class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
            @submit.prevent="deleteUser"
          >
            <template v-if="isRequestingDeleteConfirmation">
              <label
                for="confirm-user-delete"
                class="sr-only"
                >Enter your username to confirm</label
              >

              <BaseTextInput
                id="confirm-user-delete"
                ref="confirmInput"
                v-model="usernameConfirmation"
                :placeholder="`Type ${user?.username} to confirm`"
                class="w-full sm:w-64"
              />
            </template>

            <BaseButton
              kind="danger"
              size="sm"
              button-type="submit"
              class="shrink-0"
              :disabled="deleteButtonIsDisabled"
              >{{ deleteButtonLabel }}</BaseButton
            >
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
