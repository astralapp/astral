<template>
  <div class="dashboard-dashboardHeader">
    <h2>
      <span>{{ currentTagName }}</span>
    </h2>
    <edit-tag-dropdown></edit-tag-dropdown>
    <div class="dashboard-searchBar">
      <label for="galileo">
        <input type="text" id="galileo" class="dashboard-telescope" placeholder="Gaze through your telescope" v-model="currentSearchQuery">
        <i class="fa fa-search"></i>
      </label>
    </div>
    <div class="dashboard-userDropdown" @click.stop="userDropdownVisible = !userDropdownVisible">
      <img :src="user.avatar_url" :alt="user.name" class="dashboard-userDropdownAvatar"/>
      <span class="dashboard-userDropdownName">{{ user.username }}</span>
      <i class="fa fa-chevron-down"></i>
      <user-dropdown :visible="userDropdownVisible"></user-dropdown>
    </div>
  </div>
</template>
<script>
import { user } from "../store/getters/userGetters";
import { currentTag } from "../store/getters/tagsGetters";
import { searchQuery } from "../store/getters/galileoGetters";
import { setSearchQuery } from "../store/actions";
import EditTagDropdown from "./edit-tag-dropdown.vue";
import UserDropdown from "./user-dropdown.vue";
export default {
  name: "DashboardHeader",
  data(){
    return {
      userDropdownVisible: false
    }
  },
  vuex: {
    getters: {
      user: user,
      currentTag: currentTag,
      query: searchQuery
    },
    actions: {
      setSearchQuery
    }
  },
  computed: {
    currentTagName(){
      return Object.keys(this.currentTag).length ? this.currentTag.name : "All Stars"
    },
    currentSearchQuery: {
      get(){
        return this.searchQuery;
      },
      set(newValue){
        this.setSearchQuery(newValue);
      }
    }
  },
  components: {
    "edit-tag-dropdown": EditTagDropdown,
    "user-dropdown": UserDropdown
  },
  events: {
    "HIDE_USER_DROPDOWN": function(){
      this.userDropdownVisible = false;
    }
  }
}
</script>
