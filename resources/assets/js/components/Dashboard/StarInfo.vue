<template>
<div class="star-info bg-grey-lighter relative flex flex-col">
  <div class="star-info-bar flex bg-white border-b border-grey-light h-16 px-4 items-center" v-if="!noRepoSelected">
    <div class="ml-auto">
      <label for="starCloneUrl" class="mr-2 font-bold cursor-pointer">Clone:</label>
      <input 
        type="text" 
        readonly="readonly" 
        id="starCloneUrl"
        class="github-clone-url rounded border-2 border-grey-light h-10 px-2 focus-none transition-border-color" 
        :value="currentStarCloneUrl" 
        @focus="highlightText"
      />
    </div>
  </div>
  <div class="flex flex-1 items-center justify-center w-full bg-grey-lighter" v-if="noRepoSelected">
    <span class="font-bold text-grey">No Repo Selected</span>
  </div>
  <readme v-if="readme" :readme="readme"></readme>
  <div class="flex flex-1 items-center justify-center w-full bg-grey-lighter" v-if="repoHasNoReadme">
    <span class="font-bold text-grey">No README found</span>
  </div>
</div>  
</template>
<script>
import { mapGetters } from 'vuex'
import Readme from './Readme'
export default {
  name: 'StarInfo',
  components: {
    Readme
  },
  computed: {
    ...mapGetters(['readme', 'currentStar']),
    noRepoSelected() {
      return !Object.keys(this.currentStar).length
    },
    repoHasNoReadme() {
      return Object.keys(this.currentStar).length && !this.readme
    },
    currentStarCloneUrl() {
      return `git@github.com:${this.currentStar.node.nameWithOwner}.git`
    }
  },
  methods: {
    highlightText(e) {
      e.currentTarget.select()
    }
  }
}
</script>
<style lang="scss">
.github-clone-url {
  width: 300px;
  &:focus {
    border-color: config('colors.grey');
  }
}
</style>
