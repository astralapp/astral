<template>
  <date-picker v-model="datetime" type="datetime" @change="handleChange"></date-picker>
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
      datetime: this.value
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
