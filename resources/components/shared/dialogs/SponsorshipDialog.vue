<script lang="ts" setup>
import { computed, Ref } from 'vue'
import { useSponsorshipDialog } from '@/scripts/composables/useSponsorshipDialog'
import { useAuthorizationsStore } from '@/scripts/store/useAuthorizationsStore'
import { UserGroupIcon } from '@heroicons/vue/outline'
import { Ability } from '@/scripts/types'
import ActionDialog from '@/views/components/shared/core/ActionDialog.vue'
import BaseButton from '@/views/components/shared/core/BaseButton.vue'

const { isOpen, hide, currentContext } = useSponsorshipDialog()
const authorizationsStore = useAuthorizationsStore()

const DIALOG_MESSAGES: Record<Ability, string> = {
  [Ability.CREATE_TAG]: `To create more than ${authorizationsStore.limits?.max_tags} tags`,
  [Ability.ADD_NOTES]: 'To add notes to your starred repos',
  [Ability.CREATE_SMART_FILTER]: 'To create smart filters',
}

const currentMessage: Ref<string | null> = computed(() =>
  currentContext.value ? DIALOG_MESSAGES[currentContext.value] : null
)
</script>

<template>
  <ActionDialog :is-open="isOpen" :hide="hide">
    <template #icon>
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <UserGroupIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
      </div>
    </template>

    <template #title>Sponsorship required</template>

    <template #body>
      <p v-if="currentMessage" class="text-gray-500">
        <span>{{ currentMessage }}</span>
        you must be an active
        <a
          href="https://github.com/sponsors"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-brand-700 focus:outline-none"
          >GitHub Sponsor</a
        >
        of the project. You can sponsor for as little as $1/month to get full access to all of Astral's features.
      </p>
    </template>

    <template #actions>
      <BaseButton class="w-full" @click="hide"> Nevermind </BaseButton>

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
