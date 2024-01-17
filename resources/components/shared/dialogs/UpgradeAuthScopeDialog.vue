<script setup lang="ts">
import ActionDialog from '@/components/shared/core/ActionDialog.vue'
import BaseButton from '@/components/shared/core/BaseButton.vue'
import { useUpgradeAuthScopeDialog } from '@/composables/useUpgradeAuthScopeDialog'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const { isOpen, hide, redirectToGitHub } = useUpgradeAuthScopeDialog()
</script>

<template>
  <ActionDialog
    :is-open="isOpen"
    :hide="hide"
  >
    <template #icon>
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-400/10">
        <ExclamationTriangleIcon
          class="h-6 w-6 text-yellow-800 dark:text-yellow-500"
          aria-hidden="true"
        /></div
    ></template>

    <template #title>Elevated privileges required</template>

    <template #body>
      <p class="leading-relaxed text-gray-500 dark:text-gray-300">
        Unstarring repositories requires your authorization scope to be upgraded from
        <code
          class="inline-flex items-center rounded-md bg-yellow-100 py-0.5 px-1.5 text-sm font-semibold text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500 ring-1 ring-inset ring-transparent dark:ring-yellow-400/30"
          >read:user</code
        >
        to
        <code
          class="inline-flex items-center rounded-md bg-yellow-100 px-1.5 py-0.5 text-sm font-semibold text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500 ring-1 ring-inset ring-transparent dark:ring-yellow-400/30"
          >public_repo</code
        >
        . If you would like to learn more about authorization scopes, you can consult the
        <a
          href="https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-gray-800 dark:text-gray-200 underline focus-within:outline-none"
          >official GitHub documentation</a
        >.
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
        kind="warning"
        class="w-full"
        @click="redirectToGitHub"
        >Grant access</BaseButton
      >
    </template>
  </ActionDialog>
</template>
