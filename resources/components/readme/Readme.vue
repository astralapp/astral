<script lang="ts" setup>
import EmptyState from '@/components/readme/EmptyState.vue'
import ReadmeSkeleton from '@/components/readme/ReadmeSkeleton.vue'
import BaseButton from '@/components/shared/core/BaseButton.vue'
import TransitionFade from '@/components/shared/transitions/TransitionFade.vue'
import { useStarsStore } from '@/store/useStarsStore'
import { randomIntFromRange } from '@/utils'
import { debouncedWatch } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'

const starsStore = useStarsStore()

type ReadmeStatus = 'loading' | 'loaded' | 'missing' | 'error'

const contents = ref<string>('')
const status = ref<ReadmeStatus>('loaded')

const readmeEl = ref<HTMLElement>()
const readmeContainerEl = ref<HTMLElement>()

const selectedRepoCount = computed(() => starsStore.selectedRepos.length)
const noRepoSelected = computed(() => !selectedRepoCount.value)
const isStacked = computed(() => selectedRepoCount.value > 1)
const repoUrl = computed(() => starsStore.selectedRepo?.url)

// The single source of truth for which surface the pane shows.
const view = computed<'empty' | ReadmeStatus>(() => (noRepoSelected.value ? 'empty' : status.value))

const extraStacks = ref<{ transform: string }[]>(
  Array(5)
    .fill(0)
    .map((_, index) => {
      const direction = index % 2 === 0 ? 1 : -1
      const tilt = randomIntFromRange(2, 7) * direction
      const translateX = randomIntFromRange(15, 25) * direction
      const translateY = randomIntFromRange(0.5, 2) * direction

      return { transform: `rotate(${tilt}deg) scale(0.9) translate3d(${translateX}%, ${translateY}%, 0)` }
    })
)
const visibleStacks = computed(() => extraStacks.value.slice(0, Math.min(5, selectedRepoCount.value - 1)))

watch(
  () => starsStore.selectedRepo,
  selectedRepo => {
    if (Object.keys(selectedRepo).length) {
      status.value = 'loading'
    }
  }
)
debouncedWatch(
  () => starsStore.selectedRepo,
  async selectedRepo => {
    if (Object.keys(selectedRepo).length) {
      await loadReadme()
    } else {
      contents.value = ''
    }
  },
  { debounce: 500 }
)

async function loadReadme() {
  const repoName = starsStore.selectedRepo?.nameWithOwner
  if (!repoName) return

  status.value = 'loading'

  try {
    const html = await starsStore.fetchReadme(repoName)

    if (!html) {
      contents.value = ''
      status.value = 'missing'
      return
    }

    contents.value = html
    status.value = 'loaded'

    await nextTick()

    patchReadmeAnchors()
    patchReadmeImages()

    readmeContainerEl.value?.scrollTo(0, 0)
  } catch (error) {
    // GitHub returns 404 when a repo simply has no README, which is common and not a failure.
    contents.value = ''
    status.value = isNotFoundError(error) ? 'missing' : 'error'
  }
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 404
  )
}

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
  <div
    class="relative grow overflow-y-auto"
    :aria-busy="view === 'loading'"
  >
    <!-- No repo selected -->
    <div
      v-show="view === 'empty'"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50 px-6 text-center dark:bg-gray-900"
    >
      <EmptyState
        aria-hidden="true"
        class="mb-6 h-auto w-full max-w-[220px]"
      />

      <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">No repository selected</h2>

      <p class="mt-1.5 max-w-xs text-sm text-gray-600 dark:text-gray-400">
        Pick a star from the list to read its README right here.
      </p>
    </div>

    <!-- Rendered README -->
    <div
      v-show="view === 'loaded'"
      class="relative z-20 h-full w-full overflow-hidden transition-colors"
      :class="{ 'grid place-items-center bg-gray-100 dark:bg-gray-900': isStacked }"
    >
      <div
        v-for="(stack, $index) in visibleStacks"
        :key="$index"
        :style="{ zIndex: visibleStacks.length - $index, transform: stack.transform }"
        class="pointer-events-none absolute h-[85vh] w-full max-w-none overflow-hidden rounded-lg border border-transparent bg-white p-12 shadow-lg sm:max-w-2xl dark:border-gray-500 dark:bg-gray-800"
        aria-hidden="true"
      ></div>

      <div
        ref="readmeContainerEl"
        class="relative h-full overflow-auto"
        :style="{ zIndex: visibleStacks.length + 1 }"
      >
        <div
          ref="readmeEl"
          class="prose max-w-none border border-transparent bg-white px-6 py-8 transition-transform sm:mx-auto sm:max-w-2xl sm:px-8 2xl:max-w-4xl dark:prose-invert dark:bg-gray-900 prose-a:font-medium prose-a:text-brand-700 dark:prose-a:text-brand-400"
          :class="{
            'pointer-events-none h-[85vh] scale-90 overflow-hidden rounded-lg p-12 shadow-lg dark:border-gray-500':
              isStacked,
          }"
          v-html="contents"
        ></div>

        <p
          v-show="isStacked"
          class="sr-only"
        >
          {{ selectedRepoCount }} Stars selected
        </p>
      </div>
    </div>

    <!-- Repo has no README -->
    <div
      v-show="view === 'missing'"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white px-6 text-center dark:bg-gray-900"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />

          <path d="M14 2v4a2 2 0 0 0 2 2h4" />

          <path d="M9 13a1.5 1.5 0 0 1 3 .5c0 1-1.5 1.25-1.5 2.5" />

          <path d="M10.5 18.5v.01" />
        </svg>
      </div>

      <h2 class="mt-4 text-base font-semibold text-gray-900 dark:text-gray-100">No README found</h2>

      <p class="mt-1.5 max-w-xs text-sm text-gray-600 dark:text-gray-400">
        This repository doesn't have a README file.
      </p>

      <BaseButton
        v-if="repoUrl"
        as="link"
        :href="repoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-5"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          class="-ml-0.5 mr-1.5 h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M12 1C5.92 1 1 5.92 1 12c0 4.86 3.15 8.98 7.52 10.43.55.1.75-.24.75-.53 0-.26-.01-.95-.01-1.86-3.06.66-3.71-1.48-3.71-1.48-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.69-1.47-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.13.88-.24 1.82-.36 2.76-.37.94 0 1.88.13 2.76.37 2.1-1.43 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.22-2.58 5.15-5.03 5.42.39.34.74 1 .74 2.03 0 1.47-.01 2.65-.01 3.01 0 .29.2.64.76.53C19.85 20.98 23 16.86 23 12c0-6.08-4.92-11-11-11z"
          />
        </svg>

        <span>View on GitHub</span>
      </BaseButton>
    </div>

    <!-- README failed to load -->
    <div
      v-show="view === 'error'"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white px-6 text-center dark:bg-gray-900"
      role="alert"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />

          <path d="M12 9v4" />

          <path d="M12 17h.01" />
        </svg>
      </div>

      <h2 class="mt-4 text-base font-semibold text-gray-900 dark:text-gray-100">Couldn't load the README</h2>

      <p class="mt-1.5 max-w-xs text-sm text-gray-600 dark:text-gray-400">
        Something went wrong fetching this README. Check your connection and try again.
      </p>

      <div class="mt-5 flex items-center gap-2">
        <BaseButton
          kind="primary"
          @click="loadReadme"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="-ml-0.5 mr-1.5 h-4 w-4"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" />

            <path d="M3 3v5h5" />
          </svg>

          <span>Try again</span>
        </BaseButton>

        <BaseButton
          v-if="repoUrl"
          as="link"
          :href="repoUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </BaseButton>
      </div>
    </div>

    <!-- Loading -->
    <TransitionFade
      :show="view === 'loading'"
      as="div"
      class="absolute inset-0 z-30 h-full overflow-hidden bg-white dark:bg-gray-900"
      role="status"
      aria-label="Loading README"
    >
      <ReadmeSkeleton />
    </TransitionFade>
  </div>
</template>

<style>
.entry-content .markdown-heading {
  width: 100%;
  position: relative;
}
.entry-content .markdown-heading a.anchor {
  margin-right: 0.3em;
  position: absolute;
  left: -1.5em;
}

/* Centered headings (align="center") would strand the absolutely-positioned permalink
   out in the left margin while the text sits centered, so drop it in those cases. */
.entry-content .heading-element[align='center'] + a.anchor,
.entry-content [align='center'] .markdown-heading a.anchor {
  display: none;
}

.entry-content .markdown-heading h1 + a.anchor {
  top: 0.3em;
}

.entry-content .markdown-heading .heading-element:is(h2, h3, h4, h5, h6) + a.anchor {
  top: 0;
}

.entry-content .heading-element + a.anchor .octicon-link {
  display: inline;
}

@media (prefers-color-scheme: dark) {
  .entry-content .heading-element + a.anchor .octicon-link {
    fill: #99a1af;
  }
}

.entry-content p[dir] a > img {
  display: inline-block;
  margin: 0;
}

/* Video embeds. GitHub wraps README videos in a <details class="details-reset">
   with a <summary> file header and a <video>, styled entirely by Primer classes we
   don't load. Restyle the structure into a tidy, theme-aware media card. */
.entry-content details.details-reset {
  width: fit-content;
  max-width: 100%;
  margin: 1.25rem auto;
  border: 1px solid #d1d5dc;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.entry-content details.details-reset > summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #364153;
  background: #f9fafb;
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.entry-content details.details-reset > summary::-webkit-details-marker {
  display: none;
}

.entry-content details.details-reset > summary .octicon {
  flex-shrink: 0;
  fill: currentColor;
}

.entry-content details.details-reset > summary .dropdown-caret {
  display: none;
}

.entry-content details.details-reset > summary > span:not(.dropdown-caret) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-content details.details-reset > summary::after {
  content: '';
  margin-left: auto;
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  background-color: currentColor;
  opacity: 0.55;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    center / contain no-repeat;
  transition: transform 200ms ease;
}

.entry-content details.details-reset[open] > summary::after {
  transform: rotate(180deg);
}

.entry-content details.details-reset video {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: #000000;
}

/* Bare videos that aren't wrapped in a details embed. */
.entry-content video {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  height: auto;
  margin: 1.25rem auto;
  border-radius: 8px;
  background: #000000;
}

@media (prefers-color-scheme: dark) {
  .entry-content details.details-reset {
    border-color: #364153;
    background: #101828;
  }

  .entry-content details.details-reset > summary {
    color: #d1d5dc;
    background: #1e2939;
  }
}

@media (prefers-reduced-motion: reduce) {
  .entry-content details.details-reset > summary::after {
    transition: none;
  }
}

/* Syntax highlighting */
.highlight {
  margin-bottom: 1rem;
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
</style>
