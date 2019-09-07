<template>
  <input
    type="number"
    class="text-input text-sm px-2 py-3 w-64 ml-4 flex-grow"
    :value="value"
    @input="$emit('change', $event.target.value)"
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
