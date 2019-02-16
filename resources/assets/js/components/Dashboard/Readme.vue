<template>
  <div
    ref="readme"
    class="repo-readme flex-1 p-4 text-grey-darkest bg-white w-full overflow-y-scroll"
    v-html="readme"
  />
</template>
<script>
import URI from 'urijs'
export default {
  name: 'Readme',
  props: ['star', 'readme'],
  watch: {
    readme: {
      handler(newVal, oldVal) {
        if (oldVal !== newVal) {
          setTimeout(() => {
            this.$refs.readme.scrollTop = 0
            this.bindAnchors()
            this.fixRelativeImagePaths()
          }, 0)
        }
      },
      immediate: true
    }
  },
  methods: {
    bindAnchors() {
      Array.from(document.querySelectorAll('.repo-readme a')).forEach(anchor => {
        anchor.addEventListener(
          'click',
          e => {
            const $target = e.currentTarget
            if ($target.classList.contains('anchor') || $target.getAttribute('href').startsWith('#')) {
              e.preventDefault()
              const target = $target.getAttribute('href')
              const section = document.querySelector(`.repo-readme #user-content-${target.substring(1)}`)
              this.$refs.readme.scrollTop = section.offsetTop - 74
            }
          },
          false
        )
      })
    },
    fixRelativeImagePaths() {
      Array.from(document.querySelectorAll('.repo-readme img[src]')).forEach(img => {
        const src = URI(img.src)
        const star = this.star.node
        if (src.origin() === window.location.origin) {
          img.src = `${star.url}/raw/${star.defaultBranchRef.name}/${src.path()}`
        }
      })
    }
  }
}
</script>
<style lang="scss">
.repo-readme {
  a {
    color: config('colors.brand');
    font-family: config('fonts.sans');
    &.anchor {
      margin-right: 10px;
    }
    &:hover {
      text-decoration: none;
    }
  }
  h1,
  h2,
  h3,
  h4 {
    margin: 1em 0;
  }
  .markdown-body > h1 {
    margin-top: 0;
  }
  p {
    margin: 1em 0;
    line-height: 1.3;
  }

  ul,
  ol {
    margin-bottom: 1em;
  }

  pre {
    font-size: 14px;
    margin-bottom: 0;
    word-break: normal;
    border: 1px solid config('colors.grey-light');
    padding: 0.5rem;
  }
  /* syntax highlighting */

  .highlight {
    margin-bottom: 16px;
  }

  .highlight pre {
    margin-bottom: 0;
    word-break: normal;
    border: 1px solid config('colors.grey-light');
    padding: 0.5rem;
  }

  .pl-c {
    color: #969896;
  }

  .pl-c1,
  .pl-mdh,
  .pl-mm,
  .pl-mp,
  .pl-mr,
  .pl-s1 .pl-v,
  .pl-s3,
  .pl-sc,
  .pl-sv {
    color: #0086b3;
  }

  .pl-e,
  .pl-en {
    color: #795da3;
  }

  .pl-s1 .pl-s2,
  .pl-smi,
  .pl-smp,
  .pl-stj,
  .pl-vo,
  .pl-vpf {
    color: #333;
  }

  .pl-ent {
    color: #63a35c;
  }

  .pl-k,
  .pl-s,
  .pl-st {
    color: #a71d5d;
  }

  .pl-pds,
  .pl-s1,
  .pl-s1 .pl-pse .pl-s2,
  .pl-sr,
  .pl-sr .pl-cce,
  .pl-sr .pl-sra,
  .pl-sr .pl-sre,
  .pl-src,
  .pl-v {
    color: #df5000;
  }

  .pl-id {
    color: #b52a1d;
  }

  .pl-ii {
    background-color: #b52a1d;
    color: #f8f8f8;
  }

  .pl-sr .pl-cce {
    color: #63a35c;
    font-weight: bold;
  }

  .pl-ml {
    color: #693a17;
  }

  .pl-mh,
  .pl-mh .pl-en,
  .pl-ms {
    color: #1d3e81;
    font-weight: bold;
  }

  .pl-mq {
    color: #008080;
  }

  .pl-mi {
    color: #333;
    font-style: italic;
  }

  .pl-mb {
    color: #333;
    font-weight: bold;
  }

  .pl-md,
  .pl-mdhf {
    background-color: #ffecec;
    color: #bd2c00;
  }

  .pl-mdht,
  .pl-mi1 {
    background-color: #eaffea;
    color: #55a532;
  }

  .pl-mdr {
    color: #795da3;
    font-weight: bold;
  }

  .pl-mo {
    color: #1d3e81;
  }
}
</style>
