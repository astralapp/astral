<template>
  <div class="dashboard-userDropdownMenu" v-show="visible" transition="dashboard-userDropdownMenu">
    <ul class="dashboard-userDropdownMenuItems">
      <li class="dashboard-userDropdownMenuItem"><a href="#">Settings</a></li>
      <li class="dashboard-userDropdownMenuItem"><a href="mailto:hello@astralapp.com">Support & Feedback</a></li>
      <li class="dashboard-userDropdownMenuItem"><a href="github.com/astralapp/astral">GitHub</a></li>
      <li class="dashboard-userDropdownMenuItem"><a href="https://www.creatorlove.com/syropian/astral"><i class="fa fa-heart"></i> Creator Love</a></li>
      <li class="dashboard-userDropdownMenuItem"><a href="/logout">Sign Out</a></li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "UserDropdown",
  props: ["visible"],
  methods: {
  }
}
</script>
