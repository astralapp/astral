<template>
  <div class="autocomplete-container">
    <ul v-if="term">
      <li v-for="item in source | filterBy term">
        {{ item }}
      </li>
    </ul>
  </div>
</template>
<script>
  import Vue from "vue"
  export default {
    name: "Autocomplete",
    props: ["term", "source", "on-select"],
    data(){
      return {

      }
    }
  }
</script>
<style>
.autocomplete-container, .autocomplete-container * {
  box-sizing: border-box;
}
.autocomplete-container {
  background: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(55,53,112,0.1);
  border-radius: 3px;
  box-shadow: 0 5px 10px rgba(0,0,0,0.2);
  position: absolute; top: 50px; left: 15px;
  margin-top: 5px;
  width: 218px;
}
.autocomplete-container ul {
  list-style-type: none;
  margin: 0; padding: 0;
}

.autocomplete-container ul li {
  font-size: 0.85rem;
  padding: 0 10px;
}
</style>
