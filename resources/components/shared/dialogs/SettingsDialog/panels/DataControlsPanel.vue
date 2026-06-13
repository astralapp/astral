<script setup lang="ts">
import BaseButton from '@/components/shared/core/BaseButton.vue'
import BaseTextInput from '@/components/shared/core/BaseTextInput.vue'
import SettingsRow from '@/components/shared/dialogs/SettingsDialog/SettingsRow.vue'
import { useAuth } from '@/composables/use-auth'
import { useUserStore } from '@/store/useUserStore'
import { router } from 'hybridly'
import { computed, nextTick, ref } from 'vue'

const { user } = useAuth()
const userStore = useUserStore()

const isRequestingDeleteConfirmation = ref(false)
const usernameConfirmation = ref('')
const confirmInput = ref<InstanceType<typeof BaseTextInput> | null>(null)

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
