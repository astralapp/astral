<template>
  <input
    type="text"
    class="text-input text-sm px-2 py-3 w-64 ml-4 flex-grow"
    :value="value"
    @input="$emit('input', $event.target.value)"
  />
</template>

<script>
export default {
  props: {
    value: String
  }
}
</script>

<style></style>
