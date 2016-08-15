<template>
  <div class="toggleSwitch">
    <input type="checkbox" :id="key" :checked="checked" @change="change"></input>
    <label :for="key"></label>
  </div>
</template>
<script>
  export default {
    name: "ToggleSwitch",
    props: ["checked", "key", "change"]
  }
</script>
