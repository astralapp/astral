import { ref } from 'vue'

// Shared trigger for the app tour. The driver.js run itself lives in
// dashboard.view.vue (where the sidebar/selection state it drives is in scope);
// this just lets the Settings "Replay" button and the on-mount auto-start both
// funnel through one place. `startSignal` is bumped to request a (re)run.
const startSignal = ref(0)

export function useTour() {
  return {
    startSignal,
    start: () => {
      startSignal.value++
    },
  }
}
