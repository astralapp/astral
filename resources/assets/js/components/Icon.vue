<script>
import * as icons from 'vue-feather-icons'

export default {
  name: 'Icon',
  functional: true,
  props: {
    type: { type: String, required: true }
  },
  render (h, ctx) {
    return h(icons[ctx.props.type], ctx.data)
  }
}
</script>
