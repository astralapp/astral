<template>
  <div class="settingsPanel-backdrop">
    <div class="settingsPanel-panel">
      <div class="settingsPanel-header">
        <h3>Settings</h3>
        <button class="settingsPanel-closePanel">&times;</button>
      </div>
      <div class="settingsPanel-panelContent">
        <div class="settingsPanel-row">
          <div class="settingsPanel-settingName">
            Auto-Tag by Language
          </div>
          <div class="settingsPanel-settingControl">
            <toggle-switch :checked="languageAutotag"></toggle-switch>
          </div>
        </div>
        <div class="settingsPanel-row">
          <div class="settingsPanel-settingName">
            Export Stars As JSON
          </div>
          <div class="settingsPanel-settingControl">
            <button class="btn-flat">Export</button>
          </div>
        </div>
      </div>
      <div class="settingsPanel-footer">
        <button class="btn-flat">Done</button>
      </div>
    </div>
  </div>
</template>
<script>

</script>
