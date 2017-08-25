<template>
  <transition name="dashboard-sortTagsDropdownMenu">
    <div class="dashboard-sortTagsDropdownMenu" v-show="visible">
      <ul class="dashboard-sortTagsDropdownMenuItems">
        <li class="dashboard-sortTagsDropdownMenuItem" @click="sortTags('ALPHA_ASC')"><i class="fa fa-sort-alpha-asc"></i> Alphabetical (A-Z)</li>
        <li class="dashboard-sortTagsDropdownMenuItem" @click="sortTags('ALPHA_DESC')"><i class="fa fa-sort-alpha-desc"></i> Alphabetical (Z-A)</li>
        <li class="dashboard-sortTagsDropdownMenuItem" @click="sortTags('STARS_DESC')"><i class="fa fa-sort-numeric-desc"></i> Most Stars</li>
        <li class="dashboard-sortTagsDropdownMenuItem" @click="sortTags('STARS_ASC')"><i class="fa fa-sort-numeric-asc"></i> Fewest Stars</li>
      </ul>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'SortTagsDropdown',
  props: ['visible'],
  methods: {
    sortTags (sorter) {
      this.$bus.$emit('TAGS_SORTED', sorter)
    }
  }
}
</script>
<style lang="scss">
@import "../../sass/application/shared/variables";
.dashboard-sortTagsDropdownMenu {
  transform: translate(-65%, 0) scale(1);
  background: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(#373570, 0.1);
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.08);
  position: absolute; top: 100%; left: 50%;
  width: 175px;
  z-index: 999;
  &::before {
    transform: translateX(-50%) rotate(45deg);
    width: 12px; height: 12px;
    background: #fff;
    background-clip: padding-box;
    border-top: 1px solid rgba(#373570, 0.1);
    border-left: 1px solid rgba(#373570, 0.1);
    content: '';
    position: absolute; top: -6px; left: 85%;
    z-index: 99;
  }
  &-enter-active, &-leave-active {
    transition: transform 250ms $easeOutCubic, opacity 250ms $easeOutCubic;
  }
  &-enter, &-leave-to {
    transform: translate(-65%, -10px) scale(0.95);
    opacity: 0;
    visibility: hidden;
  }
}

.dashboard-sortTagsDropdownMenuItems {
  line-height: 1;
  list-style-type: none;
  margin: 12px 0; padding: 0;
  .dashboard-sortTagsDropdownMenuItem {
    display: block;
    font-size: 0.7rem;
    color: $main-text-color;
    cursor: pointer;
    display: block;
    padding: 10px 20px;
    text-decoration: none;
    &:hover {
      background: $steel-blue;
      color: #fff;
    }
  }
}

</style>
