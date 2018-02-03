<template>
<div class="relative ml-auto">
  <div class="flex items-center cursor-pointer" v-on-clickaway="hideDropdown" @click="visible = !visible">
    <img 
      :src="user.avatar_url" 
      :alt="user.username"
      class="rounded-full w-10 h-10"
    />
    <span class="text-white ml-1">{{ user.username }}</span>
    <feather-icon
      type="chevron-down"
      height="16"
      width="16"
      class="stroke-current text-white ml-1"
    >
    </feather-icon>
  </div>
  <div class="user-dropdown-container absolute pin-t pin-r bg-white rounded shadow z-10 overflow-hidden" v-show="visible">
    <ul class="list-reset">
      <li>
        <a 
          class="block px-4 py-2 text-grey-darkest no-underline hover:bg-grey-lightest" 
          href="#">Settings</a>
      </li>
      <li>
        <a 
          class="block px-4 py-2 text-grey-darkest no-underline hover:bg-grey-lightest" 
          href="https://github.com/astralapp/astral" target="_blank" rel="noopener">GitHub</a>
      </li>
      <li>
        <a 
          class="block px-4 py-2 text-grey-darkest no-underline hover:bg-grey-lightest" 
          href="https://patreon.com/syropian" target="_blank" rel="noopener">Patreon</a>
      </li>
      <li>
        <a 
          class="block px-4 py-2 text-grey-darkest no-underline hover:bg-grey-lightest" 
          href="#">Logout</a>
      </li>
    </ul>
  </div>
</div>
</template>
<script>
import { mapGetters } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'
export default {
  name: 'UserDropdown',
  mixins: [clickaway],
  data() {
    return {
      visible: false
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  methods: {
    hideDropdown() {
      this.visible = false
    }
  }
}
</script>
<style>
.user-dropdown-container {
  width: 160px;
  margin-top: 45px;
}
</style>

