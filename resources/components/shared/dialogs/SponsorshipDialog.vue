<script lang="ts" setup>
import ActionDialog from '@/components/shared/core/ActionDialog.vue'
import BaseButton from '@/components/shared/core/BaseButton.vue'
import { useSponsorshipDialog } from '@/composables/useSponsorshipDialog'
import { useAuthorizationsStore } from '@/store/useAuthorizationsStore'
import { Ability } from '@/types'
import { UserGroupIcon } from '@heroicons/vue/outline'
import { Ref, computed } from 'vue'

const { isOpen, hide, currentContext } = useSponsorshipDialog()
const authorizationsStore = useAuthorizationsStore()

const DIALOG_MESSAGES: Record<App.Data.Enums.Ability, string> = {
  [Ability.ADD_NOTES]: 'To add notes to your starred repos',
  [Ability.CREATE_SMART_FILTER]: 'To create smart filters',
  [Ability.CREATE_TAG]: `To create more than ${authorizationsStore.limits?.max_tags} tags`,
}

const currentMessage: Ref<null | string> = computed(() =>
  currentContext.value ? DIALOG_MESSAGES[currentContext.value] : null
)
</script>

<template>
  <ActionDialog
    :is-open="isOpen"
    :hide="hide"
  >
    <template #icon>
      <div
        class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10 dark:text-green-400"
      >
        <UserGroupIcon
          class="h-6 w-6 text-green-600"
          aria-hidden="true"
        />
      </div>
    </template>

    <template #title>Sponsorship required</template>

    <template #body>
      <p
        v-if="currentMessage"
        class="text-gray-500 dark:text-gray-300"
      >
        <span>{{ currentMessage }}</span>
        you must be an active
        <a
          href="https://github.com/sponsors"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-brand-700 dark:text-brand-500 focus:outline-none"
          >GitHub Sponsor</a
        >
        of the project. You can sponsor for as little as $1/month to get full access to all of Astral's features.
      </p>
    </template>

    <template #actions>
      <BaseButton
        class="w-full"
        @click="hide"
      >
        Nevermind
      </BaseButton>

      <BaseButton
        as="link"
        kind="primary"
        href="https://github.com/sponsors/syropian"
        rel="noopener noreferrer"
        target="_blank"
        class="w-full"
        @click="hide"
      >
        I'd like to be a sponsor!
      </BaseButton>
    </template>
  </ActionDialog>
</template>
