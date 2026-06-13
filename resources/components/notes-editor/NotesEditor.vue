<script setup lang="ts">
import BaseButton from '@/components/shared/core/BaseButton.vue'
import ToolbarButton from '@/components/toolbar/ToolbarButton.vue'
import { useNotesEditor } from '@/composables/useNotesEditor'
import { useStarsStore } from '@/store/useStarsStore'
import { useUserStore } from '@/store/useUserStore'
import { TransitionChild, TransitionRoot } from '@headlessui/vue'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { onKeyStroke } from '@vueuse/core'
import { router } from 'hybridly'
import debounce from 'lodash/debounce'
import { Markdown } from 'tiptap-markdown'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const starsStore = useStarsStore()
const userStore = useUserStore()
const { isOpen, hide } = useNotesEditor()

type SaveState = 'dirty' | 'error' | 'idle' | 'saved' | 'saving'
const saveState = ref<SaveState>('idle')
let isSettingContent = false
let savedResetTimeout: ReturnType<typeof setTimeout> | undefined

const userStar = computed(() => starsStore.userStarsByRepoId[starsStore.selectedRepo.databaseId])
const autosaveEnabled = computed(() => !!userStore.user?.settings.autosave_notes)

const repoOwner = computed(() => starsStore.selectedRepo.nameWithOwner?.split('/')[0] ?? '')
const repoName = computed(() => starsStore.selectedRepo.nameWithOwner?.split('/').slice(1).join('/') ?? '')

const status = computed(() => {
  switch (saveState.value) {
    case 'dirty':
      return { class: 'text-gray-500 dark:text-gray-400', text: 'Unsaved changes' }
    case 'error':
      return { class: 'text-red-600 dark:text-red-500', text: 'Couldn’t save' }
    case 'saved':
      return { class: 'text-brand-600 dark:text-brand-500', text: 'Saved' }
    case 'saving':
      return { class: 'text-gray-500 dark:text-gray-400', text: 'Saving…' }
    default:
      return null
  }
})

const isMac = typeof navigator !== 'undefined' && /ipad|iphone|ipod|mac/i.test(navigator.userAgent)
const sc = (combo: string) => {
  const map = isMac ? { alt: '⌥', mod: '⌘', shift: '⇧' } : { alt: 'Alt', mod: 'Ctrl', shift: 'Shift' }
  const tokens = combo.split('+').map(part => (map as Record<string, string>)[part] ?? part.toUpperCase())
  return isMac ? tokens.join('') : tokens.join('+')
}

const debouncedAutosave = debounce(() => saveNotes(), 1000)

const editor = useEditor({
  content: '',
  editorProps: {
    attributes: {
      class:
        'prose dark:prose-invert max-w-none prose-a:text-brand-600 dark:prose-a:text-brand-500 focus:outline-hidden h-full',
    },
  },
  extensions: [
    StarterKit,
    Typography,
    Link.configure({ openOnClick: false }),
    Underline,
    Markdown,
    Placeholder.configure({ placeholder: 'Add notes about this repo…' }),
  ],
  onUpdate: () => {
    if (isSettingContent) return

    saveState.value = 'dirty'
    if (autosaveEnabled.value) debouncedAutosave()
  },
})

watch(() => starsStore.selectedRepo, setInitialEditorContents, { immediate: true })

watch(isOpen, open => {
  if (open) editor.value?.commands.focus('end')
})

onMounted(setInitialEditorContents)

function setInitialEditorContents() {
  isSettingContent = true
  editor.value?.commands.setContent(userStar.value?.notes ?? '', false)
  isSettingContent = false
  saveState.value = 'idle'
  editor.value?.commands.focus('end')
}

function saveNotes() {
  const instance = editor.value
  if (!instance) return

  saveState.value = 'saving'
  const notesData = instance.isEmpty ? null : instance.storage.markdown.getMarkdown()
  const { description, nameWithOwner, databaseId: repoId, url } = starsStore.selectedRepo

  router.put(route('star.notes.update'), {
    data: { description, nameWithOwner, notes: notesData, repoId, url },
    hooks: {
      error: () => (saveState.value = 'error'),
      success: () => {
        saveState.value = 'saved'
        clearTimeout(savedResetTimeout)
        savedResetTimeout = setTimeout(() => {
          if (saveState.value === 'saved') saveState.value = 'idle'
        }, 2000)
      },
    },
    only: ['stars'],
  })
}

// Closing flushes a pending edit so notes are never silently dropped, whether or not autosave is on.
const close = () => {
  if (saveState.value === 'dirty') {
    debouncedAutosave.cancel()
    saveNotes()
  }
  hide()
}

const isLinkEditorOpen = ref(false)
const linkUrl = ref('')
const linkInput = ref<HTMLInputElement | null>(null)
const hasLink = computed(() => !!editor.value?.isActive('link'))

const openLinkEditor = () => {
  linkUrl.value = editor.value?.getAttributes('link').href ?? ''
  isLinkEditorOpen.value = true
  nextTick(() => linkInput.value?.focus())
}

const closeLinkEditor = () => {
  isLinkEditorOpen.value = false
  editor.value?.chain().focus().run()
}

const normalizeUrl = (raw: string) => {
  const url = raw.trim()
  if (!url) return ''
  return /^(#|\/|https?:|mailto:)/i.test(url) ? url : `https://${url}`
}

const applyLink = () => {
  const instance = editor.value
  if (!instance) return

  const href = normalizeUrl(linkUrl.value)
  if (!href) return removeLink()

  if (instance.state.selection.empty && !instance.isActive('link')) {
    instance.chain().focus().insertContent(`<a href="${href}">${href}</a>`).run()
  } else {
    instance.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }

  isLinkEditorOpen.value = false
}

const removeLink = () => {
  editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  isLinkEditorOpen.value = false
}

onKeyStroke('Escape', () => {
  if (isLinkEditorOpen.value) return closeLinkEditor()
  if (isOpen.value) close()
})

onKeyStroke('s', e => {
  if (isOpen.value && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    saveNotes()
  }
})

onKeyStroke('k', e => {
  if (isOpen.value && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    openLinkEditor()
  }
})
</script>

<template>
  <TransitionRoot
    as="template"
    :show="isOpen"
    appear
  >
    <div
      class="absolute inset-0 z-30 mt-16 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-editor-title"
    >
      <TransitionChild
        as="template"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="absolute inset-0 bg-gray-500/75 backdrop-blur-xs transition-opacity duration-300 motion-reduce:transition-none dark:bg-gray-900/80"
          @click.self="close"
        ></div>
      </TransitionChild>

      <TransitionChild
        as="template"
        enter-from="-translate-x-full opacity-0"
        enter-to="translate-x-0 opacity-100"
        leave-from="translate-x-0 opacity-100"
        leave-to="-translate-x-full opacity-0"
      >
        <div
          class="absolute inset-y-0 left-0 flex w-full max-w-prose transform flex-col overflow-hidden rounded-r-lg bg-white shadow-xl transition duration-300 motion-reduce:transition-none dark:bg-gray-900"
        >
          <!-- Header -->
          <header class="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <i-lucide-notebook-pen
              class="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500"
              role="presentation"
            />

            <div class="min-w-0">
              <h2
                id="notes-editor-title"
                class="text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100"
              >
                Notes
              </h2>

              <p class="flex min-w-0 text-xs leading-tight">
                <span class="truncate text-gray-500 dark:text-gray-400">{{ repoOwner }}</span>

                <span class="shrink-0 text-gray-500 dark:text-gray-400">/</span>

                <span class="truncate text-brand-600 dark:text-brand-500">{{ repoName }}</span>
              </p>
            </div>

            <ToolbarButton
              class="ml-auto"
              size="sm"
              label="Close notes"
              shortcut="Esc"
              @click="close"
            >
              <i-lucide-x class="h-4 w-4" />
            </ToolbarButton>
          </header>

          <!-- Formatting toolbar -->
          <div
            v-if="editor"
            class="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-gray-200 px-2.5 py-2 dark:border-gray-800"
            role="toolbar"
            aria-label="Text formatting"
          >
            <ToolbarButton
              size="sm"
              label="Bold"
              :shortcut="sc('mod+B')"
              :active="editor.isActive('bold')"
              @click="editor.chain().focus().toggleBold().run()"
            >
              <i-lucide-bold class="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              size="sm"
              label="Italic"
              :shortcut="sc('mod+I')"
              :active="editor.isActive('italic')"
              @click="editor.chain().focus().toggleItalic().run()"
            >
              <i-lucide-italic class="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              size="sm"
              label="Underline"
              :shortcut="sc('mod+U')"
              :active="editor.isActive('underline')"
              @click="editor.chain().focus().toggleUnderline().run()"
            >
              <i-lucide-underline class="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              size="sm"
              label="Strikethrough"
              :shortcut="sc('mod+shift+S')"
              :active="editor.isActive('strike')"
              @click="editor.chain().focus().toggleStrike().run()"
            >
              <i-lucide-strikethrough class="h-4 w-4" />
            </ToolbarButton>

            <div
              class="mx-1 h-5 w-px shrink-0 bg-gray-200 dark:bg-gray-700"
              aria-hidden="true"
            ></div>

            <ToolbarButton
              size="sm"
              label="Bullet list"
              :shortcut="sc('mod+shift+8')"
              :active="editor.isActive('bulletList')"
              @click="editor.chain().focus().toggleBulletList().run()"
            >
              <i-lucide-list class="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              size="sm"
              label="Numbered list"
              :shortcut="sc('mod+shift+7')"
              :active="editor.isActive('orderedList')"
              @click="editor.chain().focus().toggleOrderedList().run()"
            >
              <i-lucide-list-ordered class="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              size="sm"
              label="Quote"
              :shortcut="sc('mod+shift+B')"
              :active="editor.isActive('blockquote')"
              @click="editor.chain().focus().toggleBlockquote().run()"
            >
              <i-lucide-text-quote class="h-4 w-4" />
            </ToolbarButton>

            <div
              class="mx-1 h-5 w-px shrink-0 bg-gray-200 dark:bg-gray-700"
              aria-hidden="true"
            ></div>

            <ToolbarButton
              size="sm"
              label="Inline code"
              :shortcut="sc('mod+E')"
              :active="editor.isActive('code')"
              @click="editor.chain().focus().toggleCode().run()"
            >
              <i-lucide-code class="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              size="sm"
              label="Code block"
              :shortcut="sc('mod+alt+C')"
              :active="editor.isActive('codeBlock')"
              @click="editor.chain().focus().toggleCodeBlock().run()"
            >
              <i-lucide-square-code class="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              size="sm"
              label="Link"
              :shortcut="sc('mod+K')"
              :active="hasLink || isLinkEditorOpen"
              @click="openLinkEditor"
            >
              <i-lucide-link class="h-4 w-4" />
            </ToolbarButton>
          </div>

          <!-- Inline link editor -->
          <transition
            enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
            enter-from-class="-translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <div
              v-if="isLinkEditorOpen"
              class="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950/40"
            >
              <i-lucide-link
                class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
                role="presentation"
              />

              <input
                ref="linkInput"
                v-model="linkUrl"
                type="url"
                placeholder="Paste or type a link…"
                aria-label="Link URL"
                class="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:outline-hidden focus:ring-2 focus:ring-gray-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                @keydown.enter.prevent="applyLink"
              />

              <BaseButton
                size="sm"
                kind="primary"
                class="shrink-0"
                @click="applyLink"
                >Apply</BaseButton
              >

              <BaseButton
                v-if="hasLink"
                size="sm"
                kind="danger-borderless"
                class="shrink-0"
                @click="removeLink"
                >Remove</BaseButton
              >
            </div>
          </transition>

          <!-- Editor -->
          <div
            class="min-h-0 flex-1 cursor-text overflow-y-auto px-5 py-4"
            @click.self="editor?.commands.focus()"
          >
            <EditorContent
              :editor="editor"
              class="h-full"
            />
          </div>

          <!-- Footer -->
          <footer class="flex h-12 shrink-0 items-center gap-3 border-t border-gray-200 px-4 dark:border-gray-800">
            <p
              v-if="status"
              class="flex items-center gap-1.5 text-xs font-medium"
              :class="status.class"
              role="status"
              aria-live="polite"
            >
              <i-lucide-loader-circle
                v-if="saveState === 'saving'"
                class="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
                role="presentation"
              />

              <i-lucide-check
                v-else-if="saveState === 'saved'"
                class="h-3.5 w-3.5"
                role="presentation"
              />

              <i-lucide-triangle-alert
                v-else-if="saveState === 'error'"
                class="h-3.5 w-3.5"
                role="presentation"
              />

              <span
                v-else
                class="h-1.5 w-1.5 rounded-full bg-current"
                role="presentation"
              ></span>

              <span>{{ status.text }}</span>

              <button
                v-if="saveState === 'error'"
                type="button"
                class="ml-1 cursor-pointer underline underline-offset-2 hover:no-underline"
                @click="saveNotes"
              >
                Retry
              </button>
            </p>

            <BaseButton
              v-if="!autosaveEnabled"
              size="sm"
              kind="primary"
              class="ml-auto shrink-0"
              :disabled="saveState !== 'dirty'"
              @click="saveNotes"
              >Save notes</BaseButton
            >
          </footer>
        </div>
      </TransitionChild>
    </div>
  </TransitionRoot>
</template>

<style scoped>
@reference '../../application/tailwind.css';

:deep(.tiptap p.is-editor-empty:first-child::before) {
  @apply pointer-events-none float-left h-0 text-gray-400;
  content: attr(data-placeholder);
}

:deep(.tiptap li > p) {
  margin: 0;
}
</style>
