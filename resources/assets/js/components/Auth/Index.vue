<template>
  <div class="auth-container w-screen h-screen bg-cover bg-center flex items-center justify-center flex-col">
    <img
      src="/images/logo.svg"
      alt="Astral"
      class="h-16 mb-8"
    >
    <a
      href="/auth/github"
      class="auth-button inline-block rounded border border-white text-white text-center no-underline"
    >
      Sign In
    </a>
  </div>
</template>
<style lang="scss">
.auth-container {
  background: url('/images/bg.jpg');
}
.auth-button {
  transition: background 250ms ease, border 250ms ease;
  background: rgba(#fff, 0.08);
  border-color: rgba(#fff, 0.65);
  box-shadow: 0 0 8px rgba(#fff, 0.3);
  font-size: 2rem;
  padding: 0.78rem 1.3rem;
  width: 300px;
  &:hover {
    background: rgba(#fff, 0.12);
    border-color: rgba(#fff, 1);
  }
}
</style>
