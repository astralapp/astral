<template>
  <DatePicker
    v-model="date"
    class="flex-grow ml-4"
    input-class="w-full px-2 py-3 text-sm text-input"
    type="date"
    @change="handleChange"
  ></DatePicker>
</template>

<script>
import DatePicker from 'vue2-datepicker'
export default {
  components: {
    DatePicker
  },
  props: {
    value: {
      type: [Date, String]
    }
  },
  data() {
    return {
      date: new Date(this.value)
    }
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss">
@import '~vue2-datepicker/index.css';
</style>
