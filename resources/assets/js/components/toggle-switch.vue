<template>
  <div class="toggleSwitch">
    <input type="checkbox" :id="key" v-model="checked"></input>
    <label :for="key"></label>
  </div>
</template>
<script>
  export default {
    name: "ToggleSwitch",
    props: ["checked", "key"]
  }
</script>
