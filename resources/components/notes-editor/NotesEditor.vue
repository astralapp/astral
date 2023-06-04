<script setup lang="ts">
import { computed, ref, unref, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import { useEditor, EditorContent, Editor } from '@tiptap/vue-3'
import { useNotesEditor } from '@/scripts/composables/useNotesEditor'
import { useStarsStore } from '@/scripts/store/useStarsStore'
import { useUserStore } from '@/scripts/store/useUserStore'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { TransitionChild, TransitionRoot } from '@headlessui/vue'
import debounce from 'lodash/debounce'
import BaseButton from '@/views/components/shared/core/BaseButton.vue'
import BoldIcon from '@/views/components/shared/icons/notes-editor/BoldIcon.vue'
import BulletListIcon from '@/views/components/shared/icons/notes-editor/BulletListIcon.vue'
import OrderedListIcon from '@/views/components/shared/icons/notes-editor/OrderedListIcon.vue'
import ItalicsIcon from '@/views/components/shared/icons/notes-editor/ItalicsIcon.vue'
import UnderlineIcon from '@/views/components/shared/icons/notes-editor/UnderlineIcon.vue'
import CodeIcon from '@/views/components/shared/icons/notes-editor/CodeIcon.vue'
import CodeBlockIcon from '@/views/components/shared/icons/notes-editor/CodeBlockIcon.vue'
import LinkIcon from '@/views/components/shared/icons/notes-editor/LinkIcon.vue'

const starsStore = useStarsStore()
const userStore = useUserStore()
const { isOpen, hide } = useNotesEditor()
const isSaving = ref(false)
const isSaveToastVisible = ref(false)

const userStar = computed(() => starsStore.userStarsByRepoId[starsStore.selectedRepo.databaseId])

const initialNotes = unref(userStar)?.notes ?? ''
let initialEditorValue = ''

try {
  initialEditorValue = JSON.parse(initialNotes || '{"type":"doc","content":[]}')
} catch (e) {
  initialEditorValue = initialNotes
}

const editor = useEditor({
  content: initialEditorValue || '<p></p>',
  extensions: [
    StarterKit,
    Typography,
    Link.configure({
      openOnClick: false,
    }),
    Underline,
    Placeholder.configure({
      placeholder: 'Add some notes about this repo...',
    }),
  ],
  onUpdate: debounce(({ editor }) => {
    if (userStore.user?.settings.autosave_notes) {
      saveNotes(editor)
    }
  }, 1000),
  editorProps: {
    attributes: {
      class: 'prose focus:outline-none prose-a:text-brand-600',
    },
  },
})

watch(
  () => starsStore.selectedRepo,
  () => {
    const initialNotes = userStar.value?.notes ?? ''
    let initialEditorValue = ''

    try {
      initialEditorValue = JSON.parse(initialNotes || '{}')
    } catch (e) {
      initialEditorValue = initialNotes
    }

    editor.value?.commands.setContent(initialEditorValue || '<p></p>')
    editor.value?.commands.focus('end')
  },
  { immediate: true }
)

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

const setLink = () => {
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

const saveNotes = (editor: Maybe<Editor>) => {
  if (editor) {
    isSaving.value = true
    const notesData = editor.isEmpty ? null : JSON.stringify(editor.getJSON())

    router.put(
      '/star/notes',
      {
        repoId: starsStore.selectedRepo.databaseId,
        notes: notesData,
      },
      {
        onFinish: () => (isSaving.value = false),
        only: ['stars'],
      }
    )
  }
}
</script>

<template>
  <TransitionRoot as="template" :show="isOpen" appear>
    <div class="absolute inset-0 z-30 mt-16" aria-keyshortcuts="n">
      <TransitionChild
        as="template"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="absolute inset-0 bg-gray-500/75 transition-opacity duration-300" @click.self="hide"></div>
      </TransitionChild>

      <div class="relative h-full w-full max-w-prose overflow-hidden py-8">
        <TransitionChild
          as="template"
          enter-from="opacity-0 -translate-x-full"
          enter-to="opacity-100 translate-x-0"
          leave-from="opacity-100 translate-x-0"
          leave-to="opacity-0 -translate-x-full"
        >
          <div class="relative h-full transform rounded-r-md bg-white p-4 shadow transition duration-300">
            <div v-if="editor" class="flex items-center rounded bg-gray-100 p-2">
              <!-- Bold Button -->
              <button
                class="rounded p-1 hover:bg-gray-200"
                :class="{
                  'bg-brand-100 text-brand-800 hover:bg-brand-200': editor.isActive('bold'),
                }"
                aria-label="Bold"
                @click="editor?.chain().focus().toggleBold().run()"
              >
                <BoldIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- Italics Button -->
              <button
                class="rounded p-1 hover:bg-gray-200"
                :class="{
                  'bg-brand-100 text-brand-800 hover:bg-brand-200': editor.isActive('italic'),
                }"
                aria-label="Italic"
                @click="editor?.chain().focus().toggleItalic().run()"
              >
                <ItalicsIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- Underline Button -->
              <button
                class="rounded p-1 hover:bg-gray-200"
                :class="{
                  'bg-brand-100 text-brand-800 hover:bg-brand-200': editor.isActive('underline'),
                }"
                aria-label="Underline"
                @click="editor?.chain().focus().toggleUnderline().run()"
              >
                <UnderlineIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- BulletList Button -->
              <button
                class="rounded p-1 hover:bg-gray-200"
                :class="{
                  'bg-brand-100 text-brand-800 hover:bg-brand-200': editor.isActive('bulletList'),
                }"
                aria-label="Bullet list"
                @click="editor?.chain().focus().toggleBulletList().run()"
              >
                <BulletListIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- OrderedList Button -->
              <button
                class="rounded p-1 hover:bg-gray-200"
                :class="{
                  'bg-brand-100 text-brand-800 hover:bg-brand-200': editor.isActive('orderedList'),
                }"
                aria-label="Ordered list"
                @click="editor?.chain().focus().toggleOrderedList().run()"
              >
                <OrderedListIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- Link Button -->
              <button
                class="rounded p-1 hover:bg-gray-200"
                :class="{
                  'bg-brand-100 text-brand-800 hover:bg-brand-200': editor.isActive('link'),
                }"
                aria-label="Link"
                @click="setLink"
              >
                <LinkIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- Code Button -->
              <button
                class="rounded p-1 hover:bg-gray-200"
                :class="{
                  'bg-brand-100 text-brand-800 hover:bg-brand-200': editor.isActive('code'),
                }"
                aria-label="Inline Code"
                @click="editor?.chain().focus().toggleCode().run()"
              >
                <CodeIcon class="h-5" />
              </button>

              <span class="mx-2 inline-block text-xs font-bold text-gray-300">|</span>

              <!-- CodeBlock Button -->
              <button
                class="rounded p-1 hover:bg-gray-200"
                :class="{
                  'bg-brand-100 text-brand-800 hover:bg-brand-200': editor.isActive('codeBlock'),
                }"
                aria-label="Code Block"
                @click="editor?.chain().focus().toggleCodeBlock().run()"
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

            <EditorContent :editor="editor" class="mt-4 h-full" />

            <TransitionRoot
              :show="isSaveToastVisible"
              enter-from="opacity-0 translate-x-full"
              enter-to="opacity-100 translate-x-0"
              leave-from="opacity-100 translate-x-0"
              leave-to="opacity-0 translate-x-full"
              as="template"
            >
              <div
                class="absolute bottom-0 right-0 z-30 mb-4 mr-4 transform rounded-full bg-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 transition"
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

<style>
.ProseMirror {
  @apply h-full;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #ced4da;
  pointer-events: none;
  height: 0;
}

.ProseMirror li > p {
  margin: 0;
}
</style>
