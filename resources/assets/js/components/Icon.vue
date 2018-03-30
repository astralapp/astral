<script>
import * as icons from 'vue-feather-icons'

export default {
  functional: true,
  name: 'Icon',
  props: {
    type: { type: String, required: true }
  },
  render (h, ctx) {
    return h(icons[ctx.props.type], ctx.data)
  }
}
</script>
