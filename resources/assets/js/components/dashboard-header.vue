<template>
  <div class="dashboard-dashboardHeader">
    <h2>
      <span>{{ currentTagName }}</span>
    </h2>
    <edit-tag-dropdown v-if="currentTagExists()"></edit-tag-dropdown>
    <div class="dashboard-searchBar">
      <label for="galileo">
        <input type="text" id="galileo" class="dashboard-telescope" placeholder="Gaze through your telescope" v-model="currentSearchQuery">
        <i class="fa fa-search"></i>
      </label>
    </div>
    <div class="dashboard-status" v-show="status != ''"><div class="status-spinner"></div> {{ status }}</div>
    <div class="dashboard-userDropdown" @click.stop="userDropdownVisible = !userDropdownVisible">
      <img :src="user.avatar_url" :alt="user.name" class="dashboard-userDropdownAvatar"/>
      <span class="dashboard-userDropdownName">{{ user.username }}</span>
      <i class="fa fa-chevron-down"></i>
      <user-dropdown :visible="userDropdownVisible" v-on-clickaway="userDropdownVisible = false"></user-dropdown>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import EditTagDropdown from "./edit-tag-dropdown.vue"
import UserDropdown from "./user-dropdown.vue"
import { mixin as clickaway } from "vue-clickaway"

export default {
  name: "DashboardHeader",
  components: {
    "edit-tag-dropdown": EditTagDropdown,
    "user-dropdown": UserDropdown
  },
  mixins: [clickaway],
  data () {
    return {
      userDropdownVisible: false,
      status: "",
      viewingUntagged: false
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      currentTag: 'currentTag',
      tagFilter: 'tagFilter',
      query: 'searchQuery'
    }),
    currentTagName () {
      if (Object.keys(this.currentTag).length) {
        return this.currentTag.name
      } else {
        return this.tagFilter === "UNTAGGED" ? "Untagged" : "All Stars"
      }
    },
    currentSearchQuery: {
      get () {
        return this.query
      },
      set (newValue) {
        this.setSearchQuery(newValue)
      }
    }
  },
  methods: {
    ...mapActions([
      'setSearchQuery'
    ]),
    currentTagExists () {
      return !!(Object.keys(this.currentTag).length)
    }
  },
  events: {
    "STATUS": function (message) {
      this.status = message
    },
    "IS_VIEWING_UNTAGGED": function (isViewing) {
      this.viewingUntagged = isViewing
    }
  }
}
</script>
