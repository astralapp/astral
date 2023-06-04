<script setup lang="ts">
import { useUpgradeAuthScopeDialog } from '@/scripts/composables/useUpgradeAuthScopeDialog'
import { ExclamationIcon } from '@heroicons/vue/outline'
import ActionDialog from '@/views/components/shared/core/ActionDialog.vue'
import BaseButton from '@/views/components/shared/core/BaseButton.vue'

const { isOpen, hide, redirectToGitHub } = useUpgradeAuthScopeDialog()
</script>

<template>
  <ActionDialog :is-open="isOpen" :hide="hide">
    <template #icon>
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
        <ExclamationIcon class="h-6 w-6 text-yellow-800" aria-hidden="true" /></div
    ></template>

    <template #title>Elevated privileges required</template>

    <template #body>
      <p class="leading-relaxed text-gray-500">
        Unstarring repositories requires your authorization scope to be upgraded from
        <code
          class="inline-flex items-center rounded-md bg-yellow-100 py-0.5 px-1.5 text-sm font-semibold text-yellow-800"
          >read:user</code
        >
        to
        <code
          class="inline-flex items-center rounded-md bg-yellow-100 px-1.5 py-0.5 text-sm font-semibold text-yellow-800"
          >public_repo</code
        >
        . If you would like to learn more about authorization scopes, you can consult the
        <a
          href="https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-gray-800 underline focus-within:outline-none"
          >official GitHub documentation</a
        >.
      </p>
    </template>

    <template #actions>
      <BaseButton class="w-full" @click="hide"> Nevermind </BaseButton>

      <BaseButton kind="warning" class="w-full" @click="redirectToGitHub">Grant access</BaseButton>
    </template>
  </ActionDialog>
</template>
