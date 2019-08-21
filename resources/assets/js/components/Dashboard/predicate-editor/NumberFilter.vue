<template>
  <input
    type="number"
    class="text-input text-sm px-2 w-64 ml-4 flex-grow"
    :value="value"
    @input="$emit('input', $event.target.value)"
  />
</template>

<script>
export default {
  props: {
    value: Number
  }
}
</script>

<style></style>
