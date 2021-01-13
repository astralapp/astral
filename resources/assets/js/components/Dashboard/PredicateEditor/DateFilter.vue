<template>
  <date-picker
    class="ml-4 flex-grow"
    v-model="date"
    input-class="text-sm px-2 py-3 text-input w-full"
    type="date"
    @change="handleChange"></date-picker>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
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
    };
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style></style>
