<template>
  <div class="inline-block relative">
    <select class="select" :value="value" @change="$emit('change', $event.target.value)">
      <slot></slot>
    </select>
    <div class="pointer-events-none absolute pin-t pin-r flex items-center px-2 text-gray-700 h-full">
      <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  </div>
</template>
<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: String
  }
}
</script>
