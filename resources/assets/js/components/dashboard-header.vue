<template>
  <div class="dashboard-header">
    <h2>
      <span>{{ currentTagName }}</span>
    </h2>
    <div class="tag-settings-trigger">
      <i class="fa fa-cog"></i>
      <!-- <div class="dropdown" hide={true}>
        <form  class="frm-tagname">
          <input type="text">
          <button class="btn-flat" type="submit">Save</button>
        </form>
        <button class="btn-flat btn-danger">Delete Tag</button>
      </div> -->
    </div>
    <label for="galileo">
      <input type="text" id="galileo" class="telescope" placeholder="Gaze through your telescope" v-model="currentSearchQuery">
      <i class="fa fa-search"></i>
    </label>
    <div class="user-dropdown-trigger dropdown-trigger">
      <img :src="user.avatar_url" alt="{{ user.name }}" class="user-avatar"/>
      <span class="user-username">{{ user.username }}</span>
      <i class="fa fa-chevron-down"></i>
      <!-- <dropdown trigger=".user-dropdown-trigger">
        <li><a >Settings</a></li>
        <li><a href="mailto:hello@astralapp.com">Support &amp; Feedback</a></li>
        <li><a href="https://gratipay.com/syropian/" target="_blank"><i class="fa fa-heart"></i> Gratipay</a></li>
        <li><a href="javascript:void(0)" onclick={parent.signOut}>Sign Out</a></li>
      </dropdown> -->
    </div>
  </div>
</template>
<script>
import { user } from "../store/getters/userGetters";
import { currentTag } from "../store/getters/tagsGetters";
import { searchQuery } from "../store/getters/galileoGetters";
import { setSearchQuery } from "../store/actions";
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
}
</script>
