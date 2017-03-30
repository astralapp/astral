<template>
  <div class="toggleSwitch">
    <input type="checkbox" :id="ukey" :checked="checked" @change="change"></input>
    <label :for="ukey"></label>
  </div>
</template>
<script>
  export default {
    name: 'ToggleSwitch',
    props: ['checked', 'ukey', 'change']
  }
</script>
