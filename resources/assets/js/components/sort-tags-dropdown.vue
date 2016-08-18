<template>
  <div class="dashboard-sortTagsDropdownMenu" v-show="visible" transition="dashboard-sortTagsDropdownMenu">
    <ul class="dashboard-sortTagsDropdownMenuItems">
      <li class="dashboard-sortTagsDropdownMenuItem" @click="sortTags('ALPHA_ASC')"><i class="fa fa-sort-alpha-asc"></i> Alphabetical (A-Z)</li>
      <li class="dashboard-sortTagsDropdownMenuItem" @click="sortTags('ALPHA_DESC')"><i class="fa fa-sort-alpha-desc"></i> Alphabetical (Z-A)</li>
      <li class="dashboard-sortTagsDropdownMenuItem" @click="sortTags('STARS_DESC')"><i class="fa fa-sort-numeric-desc"></i> Most Stars</li>
      <li class="dashboard-sortTagsDropdownMenuItem" @click="sortTags('STARS_ASC')"><i class="fa fa-sort-numeric-asc"></i> Fewest Stars</li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "SortTagsDropdown",
  props: ["visible"],
  methods: {
    sortTags (sorter) {
      this.$dispatch("TAGS_SORTED", sorter)
    }
  }
}
</script>
