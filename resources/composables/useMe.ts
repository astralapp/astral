import { usePage } from "@inertiajs/vue3";
import { computed } from "vue";
import { SharedData } from "@/scripts/types";

export function useMe() {
  const me = computed(() => usePage<SharedData>().props.user)

  return { me }
}
