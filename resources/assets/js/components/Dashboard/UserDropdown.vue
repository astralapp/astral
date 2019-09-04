<template>
  <div class="relative ml-auto">
    <div v-click-outside="hideDropdown" class="flex items-center cursor-pointer" @click="toggleDropdown">
      <img :src="user.avatar_url" :alt="user.username" class="rounded-full w-10 h-10" />
      <span class="text-white ml-1">
        {{ user.username }}
      </span>
      <Icon type="ChevronDownIcon" height="16" width="16" class="stroke-current text-white ml-1" />
    </div>
    <div v-show="visible" class="dropdown user-dropdown-container">
      <ul>
        <li>
          <a class="dropdown-item" href="#" @click.prevent="showSettingsModal">
            Settings
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="https://github.com/astralapp/astral" target="_blank" rel="noopener">
            GitHub
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="https://patreon.com/syropian" target="_blank" rel="noopener">
            Patreon
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="/auth/logout">
            Sign Out
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import vClickOutside from 'v-click-outside'
import Icon from '@/components/Icon'
export default {
  name: 'UserDropdown',
  directives: {
    clickOutside: vClickOutside.directive
  },
  components: {
    Icon
  },
  data() {
    return {
      visible: false
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  methods: {
    toggleDropdown() {
      this.$bus.$emit('dropdownOpened', -1)
      this.visible = !this.visible
    },
    hideDropdown() {
      this.visible = false
    },
    showSettingsModal() {
      this.$modal.show('settings-modal')
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
