<template>
  <input
    type="number"
    class="text-input text-sm px-2 py-3 w-64 ml-4 flex-grow"
    :value="value"
    @input="$emit('input', parseInt($event.target.value, 10))"
  />
</template>

<script>
export default {
  props: {
    value: [Number, String]
  }
}
</script>

<style></style>
