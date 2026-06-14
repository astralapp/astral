<script lang="ts" setup>
import AuthStarfield from '@/components/auth/AuthStarfield.vue'
import BaseButton from '@/components/shared/core/BaseButton.vue'
import LogoSvg from '@/img/logo.svg?component'
</script>

<template>
  <div class="relative grid min-h-dvh w-full place-items-center overflow-hidden bg-gray-950 px-6 py-12">
    <!-- Cosmic field: a faint aurora glow and a starfield. Decorative; static under reduced motion. -->
    <div
      class="aurora pointer-events-none absolute inset-0"
      aria-hidden="true"
    ></div>

    <AuthStarfield class="absolute inset-0" />

    <div class="auth-content relative z-10 flex w-full max-w-sm flex-col items-center text-center">
      <h1 class="m-0">
        <LogoSvg
          role="img"
          aria-label="Astral"
          class="h-10 w-auto fill-current text-white sm:h-12"
        />
      </h1>

      <p class="mt-6 text-base leading-relaxed text-balance text-gray-300">
        Organize your GitHub stars with tags, notes, and fast search.
      </p>

      <BaseButton
        as="link"
        kind="primary"
        size="xl"
        :href="route('login.show')"
        class="mt-8 gap-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
      >
        <i-ph-github-logo
          class="h-5 w-5"
          role="presentation"
        />

        <span>Sign in with GitHub</span>
      </BaseButton>

      <p class="mt-4 text-xs text-gray-400">Astral signs you in with GitHub. No separate password.</p>
    </div>
  </div>
</template>

<style scoped>
/* A faint green aurora behind the wordmark, plus a low horizon glow. */
.aurora {
  background: radial-gradient(55% 45% at 50% 36%, rgba(16, 185, 129, 0.16), transparent 70%),
    radial-gradient(45% 32% at 50% 102%, rgba(5, 150, 105, 0.1), transparent 70%);
}

@media (prefers-reduced-motion: no-preference) {
  .aurora {
    animation: aurora-breathe 12s ease-in-out infinite alternate;
  }
}

@keyframes aurora-breathe {
  from {
    opacity: 0.75;
  }

  to {
    opacity: 1;
  }
}

/* One restrained entrance for the brand moment. */
.auth-content {
  animation: auth-rise 500ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes auth-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-content {
    animation: none;
  }
}
</style>
