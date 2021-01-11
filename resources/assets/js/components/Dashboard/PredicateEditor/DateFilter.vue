<template>
  <date-picker v-model="datetime" type="datetime"></date-picker>
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
      type: Date,
      default: new Date()
    }
  },
  data() {
    return {
      datetime: new Date(this.value)
    };
  }
}
</script>

<style></style>
