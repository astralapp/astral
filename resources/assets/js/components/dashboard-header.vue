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
    <div class="user-dropdown-trigger dropdown-trigger">
      <img :src="user.avatar_url" :alt="user.name" class="user-avatar"/>
      <span class="user-username">{{ user.username }}</span>
      <i class="fa fa-chevron-down"></i>
    </div>
  </div>
</template>
<script>
import { user } from "../store/getters/userGetters";
import { currentTag } from "../store/getters/tagsGetters";
import { searchQuery } from "../store/getters/galileoGetters";
import { setSearchQuery } from "../store/actions";
import EditTagDropdown from "./edit-tag-dropdown.vue";
export default {
  name: "DashboardHeader",
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
      return this.currentTag.id !== -1 ? this.currentTag.name : "All Stars"
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
  }
}
</script>
<style>
.dashboard-dashboardHeader {
  background: #fff;
  border-bottom: 1px solid rgba(#373570, 0.1);
  color: #fff;
  height: $dashboard-header-height;
  line-height: $dashboard-header-height;
  position: absolute; left: $dashboard-sidebar-width; right: 0;
  h2 {
    color: $dark-blue;
    display: inline-block;
    margin: 0 0 0 20px;
  }
}
.dashboard-searchBar {
  display: inline-block;
  label[for=galileo] { position: relative; }
  .dashboard-telescope {
    @include textfield();
    border-radius: 15px;
    font-size: 0.9rem;
    height: 30px;
    padding-left: 34px;
    position: relative; top: -4px; left: 20px;
    width: 300px;
    @include placeholder {
      color: rgba($dark-steel, 0.5);
    }
    &:focus + .fa {
      color: rgba($dark-steel, 0.8);
    }
  }
  .fa {
    color: rgba($dark-steel, 0.5);
    position: absolute; top: -1px; left: 34px;
    z-index: 11;
  }
}
</style>
