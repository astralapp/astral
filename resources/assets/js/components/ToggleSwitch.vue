<template>
  <div class="relative toggle-switch">
    <input
      :id="uid"
      :checked="checked"
      type="checkbox"
      class="absolute invisible"
      @change="$emit('change', $event.target.checked)"
    />
    <label
      :for="uid"
      class=" flex items-center relative block rounded-full h-6 w-12 bg-grey-light cursor-pointer transition-bg"
    >
      <span
        :class="checked ? 'text-brand' : 'text-grey'"
        class="toggle-switch-label inline-block uppercase text-right text-sm font-bold select-none"
      >
        {{ checked ? onLabel : offLabel }}
      </span>
    </label>
  </div>
</template>
<script>
import cuid from 'cuid'
export default {
  name: 'ToggleSwitch',
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    checked: {
      type: [Boolean, Number],
      default: false
    },
    onLabel: {
      type: String,
      default: 'On'
    },
    offLabel: {
      type: String,
      default: 'Off'
    }
  },
  computed: {
    uid() {
      return cuid()
    }
  }
}
</script>
<style lang="scss" scoped>
label {
  &::after {
    transition: transform 150ms ease-in-out;
    content: '';
    display: block;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: config('colors.grey-lightest');
    transform: translate3d(0, 0, 0);
  }
  .toggle-switch-label {
    transition: color 150ms ease-in-out;
    transform: translateX(-125%);
    width: 25px;
  }
}
input:checked + label {
  background: config('colors.brand');
  &::after {
    transform: translate3d(24px, 0, 0);
  }
}
</style>
