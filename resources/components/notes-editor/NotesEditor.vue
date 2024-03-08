<script setup lang="ts">
import BaseButton from '@/components/shared/core/BaseButton.vue'
import BoldIcon from '@/components/shared/icons/notes-editor/BoldIcon.vue'
import BulletListIcon from '@/components/shared/icons/notes-editor/BulletListIcon.vue'
import CodeBlockIcon from '@/components/shared/icons/notes-editor/CodeBlockIcon.vue'
import CodeIcon from '@/components/shared/icons/notes-editor/CodeIcon.vue'
import ItalicsIcon from '@/components/shared/icons/notes-editor/ItalicsIcon.vue'
import LinkIcon from '@/components/shared/icons/notes-editor/LinkIcon.vue'
import OrderedListIcon from '@/components/shared/icons/notes-editor/OrderedListIcon.vue'
import UnderlineIcon from '@/components/shared/icons/notes-editor/UnderlineIcon.vue'
import { useNotesEditor } from '@/composables/useNotesEditor'
import { useStarsStore } from '@/store/useStarsStore'
import { useUserStore } from '@/store/useUserStore'
import { TransitionChild, TransitionRoot } from '@headlessui/vue'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent, useEditor } from '@tiptap/vue-3'
import { router } from 'hybridly'
import debounce from 'lodash/debounce'
import { Markdown } from 'tiptap-markdown'
import { computed, ref, watch } from 'vue'

const starsStore = useStarsStore()
const userStore = useUserStore()
const { isOpen, hide } = useNotesEditor()
const isSaving = ref(false)
const isSaveToastVisible = ref(false)

const userStar = computed(() => starsStore.userStarsByRepoId[starsStore.selectedRepo.databaseId])

const editor = useEditor({
  content: '',
  editorProps: {
    attributes: {
      class: 'prose focus:outline-none prose-a:text-brand-600 dark:prose-invert dark:prose-a:text-brand-500 h-full',
    },
  },
  extensions: [
    StarterKit,
    Typography,
    Link.configure({
      openOnClick: false,
    }),
    Underline,
    Markdown,
    Placeholder.configure({
      placeholder: 'Add some notes about this repo...',
    }),
  ],
  onUpdate: debounce(({ editor }) => {
    if (userStore.user?.settings.autosave_notes) {
      saveNotes(editor)
    }
  }, 1000),
})

watch(() => starsStore.selectedRepo, setInitialEditorContents, { immediate: true })

watch(isOpen, newVal => {
  if (newVal) {
    editor.value?.commands.focus('end')
  }
})

watch(isSaving, newVal => {
  if (newVal) {
    isSaveToastVisible.value = true
    setTimeout(() => {
      isSaveToastVisible.value = false
    }, 3000)
  }
})

onMounted(setInitialEditorContents)

function setInitialEditorContents() {
  let initialEditorValue = userStar.value?.notes ?? ''

  editor.value?.commands.setContent(initialEditorValue)
  editor.value?.commands.focus('end')
}

function setLink() {
  const previousUrl = editor.value?.getAttributes('link').href

  const url = window.prompt('URL', previousUrl)

  if (url === null) {
    return
  }

  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()

    return
  }

  // update link
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function saveNotes(editor: Maybe<Editor>) {
  if (editor) {
    isSaving.value = true
    const notesData = editor.isEmpty ? null : editor.storage.markdown.getMarkdown()
    const { description, nameWithOwner, databaseId: repoId, url } = starsStore.selectedRepo

    router.put(route('star.notes.update'), {
      data: {
        description,
        nameWithOwner,
        notes: notesData,
        repoId,
        url,
      },
      hooks: {
        success: () => {
          isSaving.value = false
        },
      },
      only: ['stars'],
    })
  }
}
</script>

<template>
  <TransitionRoot
    as="template"
    :show="isOpen"
    appear
  >
    <div
      class="absolute inset-0 z-30 mt-16"
      aria-keyshortcuts="n"
    >
      <TransitionChild
        as="template"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="absolute inset-0 bg-gray-500/75 dark:bg-gray-700/75 transition-opacity duration-300"
          @click.self="hide"
        ></div>
      </TransitionChild>

      <div class="relative h-full w-full max-w-prose overflow-hidden py-8">
        <TransitionChild
          as="template"
          enter-from="opacity-0 -translate-x-full"
          enter-to="opacity-100 translate-x-0"
          leave-from="opacity-100 translate-x-0"
          leave-to="opacity-0 -translate-x-full"
        >
          <div
            class="relative h-full transform rounded-r-md bg-white dark:bg-gray-900 p-4 shadow transition duration-300"
          >
            <div
              v-if="editor"
              class="flex items-center rounded bg-gray-100 dark:bg-gray-800 p-2"
            >
              <!-- Bold Button -->
              <button
                class="rounded p-1"
                :class="{
                  'bg-brand-100 text-brand-800 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-500/20':
                    editor.isActive('bold'),
                  'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100': !editor.isActive('bold'),
                }"
                aria-label="Bold"
                @click="editor.chain().focus().toggleBold().run()"
              >
                <BoldIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- Italics Button -->
              <button
                class="rounded p-1"
                :class="{
                  'bg-brand-100 text-brand-800 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-500/20':
                    editor.isActive('italic'),
                  'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100': !editor.isActive('italic'),
                }"
                aria-label="Italic"
                @click="editor.chain().focus().toggleItalic().run()"
              >
                <ItalicsIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- Underline Button -->
              <button
                class="rounded p-1"
                :class="{
                  'bg-brand-100 text-brand-800 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-500/20':
                    editor.isActive('underline'),
                  'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100': !editor.isActive('underline'),
                }"
                aria-label="Underline"
                @click="editor.chain().focus().toggleUnderline().run()"
              >
                <UnderlineIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- BulletList Button -->
              <button
                class="rounded p-1"
                :class="{
                  'bg-brand-100 text-brand-800 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-500/20':
                    editor.isActive('bulletList'),
                  'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100': !editor.isActive('bulletList'),
                }"
                aria-label="Bullet list"
                @click="editor.chain().focus().toggleBulletList().run()"
              >
                <BulletListIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- OrderedList Button -->
              <button
                class="rounded p-1"
                :class="{
                  'bg-brand-100 text-brand-800 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-500/20':
                    editor.isActive('orderedList'),
                  'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100': !editor.isActive('orderedList'),
                }"
                aria-label="Ordered list"
                @click="editor.chain().focus().toggleOrderedList().run()"
              >
                <OrderedListIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- Link Button -->
              <button
                class="rounded p-1"
                :class="{
                  'bg-brand-100 text-brand-800 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-500/20':
                    editor.isActive('link'),
                  'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100': !editor.isActive('link'),
                }"
                aria-label="Link"
                @click="setLink"
              >
                <LinkIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- Code Button -->
              <button
                class="rounded p-1"
                :class="{
                  'bg-brand-100 text-brand-800 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-500/20':
                    editor.isActive('code'),
                  'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100': !editor.isActive('code'),
                }"
                aria-label="Inline Code"
                @click="editor.chain().focus().toggleCode().run()"
              >
                <CodeIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- CodeBlock Button -->
              <button
                class="rounded p-1"
                :class="{
                  'bg-brand-100 text-brand-800 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-500/20':
                    editor.isActive('codeBlock'),
                  'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100': !editor.isActive('codeBlock'),
                }"
                aria-label="Code Block"
                @click="editor.chain().focus().toggleCodeBlock().run()"
              >
                <CodeBlockIcon class="h-5" />
              </button>

              <!-- Save Button -->
              <BaseButton
                v-if="editor"
                size="sm"
                kind="primary"
                class="ml-auto flex-shrink-0"
                :disabled="isSaving"
                @click="saveNotes(editor)"
                >{{ isSaving ? 'Saving' : 'Save' }}</BaseButton
              >
            </div>

            <EditorContent
              :editor="editor"
              class="mt-4 h-full"
            />

            <TransitionRoot
              :show="isSaveToastVisible"
              enter-from="opacity-0 translate-x-full"
              enter-to="opacity-100 translate-x-0"
              leave-from="opacity-100 translate-x-0"
              leave-to="opacity-0 translate-x-full"
              as="template"
            >
              <div
                class="absolute bottom-0 right-0 z-30 mb-4 mr-4 transform rounded-full bg-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 transition dark:bg-brand-500/10 dark:text-brand-400"
                aria-role="status"
                aria-live="assertive"
              >
                Notes saved!
              </div>
            </TransitionRoot>
          </div>
        </TransitionChild>
      </div>
    </div>
  </TransitionRoot>
</template>

<style scoped>
:deep(.tiptap p.is-editor-empty:first-child::before) {
  @apply pointer-events-none float-left h-0 text-gray-400;
  content: attr(data-placeholder);
}

:deep(.tiptap li > p) {
  margin: 0;
}
</style>
