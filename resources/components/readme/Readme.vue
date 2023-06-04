<script lang="ts" setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useStarsStore } from '@/scripts/store/useStarsStore'
import { debouncedWatch } from '@vueuse/core'
import TransitionFade from '@/views/components/shared/transitions/TransitionFade.vue'
import LoadingSpinner from '@/views/components/readme/LoadingSpinner.vue'
import ReadmeNotSelectedSvg from '../../../img/readme-not-selected.svg?component'
import { randomIntFromRange } from '@/scripts/utils'

const starsStore = useStarsStore()

const contents = ref<string>('')
const isReadmeLoading = ref(false)

const readmeEl = ref<HTMLElement>()
const readmeContainerEl = ref<HTMLElement>()

const selectedRepoCount = computed(() => starsStore.selectedRepos.length)
const noRepoSelected = computed(() => !selectedRepoCount.value)

const extraStacks = ref<{ transform: string }[]>(Array(5).fill(0).map((_, index) => {
  const direction = index % 2 === 0 ? 1 : -1
  const tilt = randomIntFromRange(2, 7) * direction
  const translateX = randomIntFromRange(15, 25) * direction
  const translateY = randomIntFromRange(0.5, 2) * direction

  return { transform: `rotate(${tilt}deg) scale(0.9) translate3d(${translateX}%, ${translateY}%, 0)` }
}))
const visibleStacks = computed(() => extraStacks.value.slice(0, Math.min(5, selectedRepoCount.value - 1)))

watch(
  () => starsStore.selectedRepo,
  selectedRepo => {
    if (Object.keys(selectedRepo).length) {
      isReadmeLoading.value = true
    }
  }
)

debouncedWatch(
  () => starsStore.selectedRepo,
  async selectedRepo => {
    if (Object.keys(selectedRepo).length) {
      if (readmeContainerEl.value && readmeEl.value) {
        const readmeContents = await starsStore.fetchReadme(selectedRepo)
        readmeContainerEl.value.scrollTo(0, 0)
        contents.value = readmeContents

        await nextTick()

        patchReadmeAnchors()
        patchReadmeImages()
      }
      isReadmeLoading.value = false
    } else {
      contents.value = ''
    }
  },
  { debounce: 500 }
)

const patchReadmeAnchors = () => {
  if (!readmeEl.value) return

  Array.from(readmeEl.value.querySelectorAll('a')).forEach(anchor => {
    if (anchor.href.replace(location.href, '').startsWith('#')) {
      anchor.addEventListener('click', e => {
        e.preventDefault()
        if (readmeContainerEl.value && readmeEl.value) {
          const anchorTop: number =
            readmeContainerEl.value.scrollTop +
            (e.currentTarget as HTMLElement).getBoundingClientRect().top -
            readmeContainerEl.value.getBoundingClientRect().top -
            16

          readmeContainerEl.value.scrollTo(0, anchorTop)
        }
      })
    } else {
      const repoName = starsStore.selectedRepo.nameWithOwner
      const repoBranch = starsStore.selectedRepo.defaultBranchRef.name
      const href = anchor.getAttribute('href')

      if (!href?.startsWith('http')) {
        anchor.href = `https://github.com/${repoName}/raw/${repoBranch}/${href}`
      }

      anchor.setAttribute('target', '_blank')
    }
  })
}

const patchReadmeImages = () => {
  if (!readmeEl.value) return

  Array.from(readmeEl.value.querySelectorAll('img')).forEach(img => {
    const repoName = starsStore.selectedRepo.nameWithOwner
    const repoBranch = starsStore.selectedRepo.defaultBranchRef.name
    const imgSrc = img.getAttribute('src')

    if (!imgSrc?.startsWith('http')) {
      img.src = `https://github.com/${repoName}/raw/${repoBranch}/${imgSrc}`
    }
  })
}
</script>

<template>
  <div ref="readmeContainerEl" class="relative flex-grow overflow-y-auto">
    <div
      v-show="noRepoSelected"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50 p-4 text-center text-gray-500 dark:bg-gray-900"
    >
      <ReadmeNotSelectedSvg aria-label="No Readme Selected" class="w-full max-w-sm" />
    </div>

    <div
      v-show="contents"
      as="div"
      class="relative z-20 h-full w-full transition-colors overflow-hidden"
      :class="{ 'grid place-items-center bg-gray-100': selectedRepoCount > 1 }"
    >
        <div
          v-for="(stack, $index) in visibleStacks"
          :key="$index"
          :style="{ zIndex: visibleStacks.length - $index, transform: stack.transform }"
          class="pointer-events-none absolute h-[85vh] w-full max-w-none overflow-hidden rounded-lg bg-white p-12 shadow-lg sm:max-w-2xl"
          aria-hidden="true"
        ></div>

      <div class="relative h-full overflow-auto" :style="{ zIndex: visibleStacks.length + 1 }">
        <div
          ref="readmeEl"
          class="prose max-w-none bg-white p-4 transition-transform dark:prose-invert dark:bg-gray-900 sm:mx-auto sm:max-w-2xl 2xl:max-w-4xl"
          :class="{
            'pointer-events-none h-[85vh] scale-90 overflow-hidden rounded-lg p-12 shadow-lg': selectedRepoCount > 1,
          }"
          v-html="contents"
        ></div>

        <div v-show="selectedRepoCount > 1" class="sr-only">{{ selectedRepoCount }} Stars selected</div>
      </div>
    </div>

    <TransitionFade
      :show="isReadmeLoading"
      as="div"
      class="absolute inset-0 z-30 flex h-full w-full items-center justify-center bg-white text-center text-gray-500 dark:bg-gray-900"
    >
      <LoadingSpinner />
    </TransitionFade>
  </div>
</template>

<style>
.entry-content {
  h1,
  h2,
  h3,
  h4,
  h4,
  h5,
  h6 {
    > a.anchor {
      margin-right: 0.3em;

      svg.octicon-link {
        display: inline;
      }
    }
  }

  p[dir] a > img {
    display: inline-block;
    margin: 0;
  }

  /* Syntax highlighting */
  .highlight {
    margin-bottom: 16px;
  }

  .highlight pre {
    margin-bottom: 0;
    word-break: normal;
    padding: 0.5rem;
  }

  /*!
  * GitHub Dark v0.5.0
  * Copyright (c) 2012 - 2017 GitHub, Inc.
  * Licensed under MIT (https://github.com/primer/github-syntax-theme-generator/blob/master/LICENSE)
  */

  .pl-c /* comment, punctuation.definition.comment, string.comment */ {
    color: #959da5;
  }

  .pl-c1 /* constant, entity.name.constant, variable.other.constant, variable.language, support, meta.property-name, support.constant, support.variable, meta.module-reference, markup.quote, markup.raw, meta.diff.header */,
  .pl-s .pl-v /* string variable */ {
    color: #c8e1ff;
  }

  .pl-e /* entity */,
  .pl-en /* entity.name */ {
    color: #b392f0;
  }

  .pl-smi /* variable.parameter.function, storage.modifier.package, storage.modifier.import, storage.type.java, variable.other */,
  .pl-s .pl-s1 /* string source */ {
    color: #f6f8fa;
  }

  .pl-ent /* entity.name.tag */ {
    color: #7bcc72;
  }

  .pl-k /* keyword, storage, storage.type */ {
    color: #ea4a5a;
  }

  .pl-s /* string */,
  .pl-pds /* punctuation.definition.string, source.regexp, string.regexp.character-class */,
  .pl-s .pl-pse .pl-s1 /* string punctuation.section.embedded source */,
  .pl-sr /* string.regexp */,
  .pl-sr .pl-cce /* string.regexp constant.character.escape */,
  .pl-sr .pl-sre /* string.regexp source.ruby.embedded */,
  .pl-sr .pl-sra /* string.regexp string.regexp.arbitrary-repitition */ {
    color: #79b8ff;
  }

  .pl-v /* variable */,
  .pl-ml /* markup.list, sublimelinter.mark.warning */ {
    color: #fb8532;
  }

  .pl-bu /* invalid.broken, invalid.deprecated, invalid.unimplemented, message.error, brackethighlighter.unmatched, sublimelinter.mark.error */ {
    color: #d73a49;
  }

  .pl-ii /* invalid.illegal */ {
    color: #fafbfc;
    background-color: #d73a49;
  }

  .pl-c2 /* carriage-return */ {
    color: #fafbfc;
    background-color: #d73a49;
  }

  .pl-c2::before /* carriage-return */ {
    content: '^M';
  }

  .pl-sr .pl-cce /* string.regexp constant.character.escape */ {
    font-weight: bold;
    color: #7bcc72;
  }

  .pl-mh /* markup.heading */,
  .pl-mh .pl-en /* markup.heading entity.name */,
  .pl-ms /* meta.separator */ {
    font-weight: bold;
    color: #0366d6;
  }

  .pl-mi /* markup.italic */ {
    font-style: italic;
    color: #f6f8fa;
  }

  .pl-mb /* markup.bold */ {
    font-weight: bold;
    color: #f6f8fa;
  }

  .pl-md /* markup.deleted, meta.diff.header.from-file, punctuation.definition.deleted */ {
    color: #ff9491;
    background-color: #380200;
  }

  .pl-mi1 /* markup.inserted, meta.diff.header.to-file, punctuation.definition.inserted */ {
    color: #66b66d;
    background-color: #334641;
  }

  .pl-mc /* markup.changed, punctuation.definition.changed */ {
    color: #b08800;
    background-color: #fffdef;
  }

  .pl-mi2 /* markup.ignored, markup.untracked */ {
    color: #2f363d;
    background-color: #959da5;
  }

  .pl-mdr /* meta.diff.range */ {
    font-weight: bold;
    color: #b392f0;
  }

  .pl-mo /* meta.output */ {
    color: #0366d6;
  }

  .pl-ba /* brackethighlighter.tag, brackethighlighter.curly, brackethighlighter.round, brackethighlighter.square, brackethighlighter.angle, brackethighlighter.quote */ {
    color: #ffeef0;
  }

  .pl-sg /* sublimelinter.gutter-mark */ {
    color: #6a737d;
  }

  .pl-corl /* constant.other.reference.link, string.other.link */ {
    text-decoration: underline;
    color: #79b8ff;
  }
}
</style>
