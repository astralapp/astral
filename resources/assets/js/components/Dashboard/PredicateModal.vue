<template>
  <VueModal name="predicate-modal" height="auto" :width="680">
    <div class="flex items-center justify-between px-4 py-3 bg-grey-lightest leading-none">
      <h3>Add a new filter</h3>
      <button
        class="text-2xl focus-none rounded-full w-8 h-8 bg-transparent indent-px hover:bg-grey-light transition-bg"
        @click="closeModal"
      >
        &times;
      </button>
    </div>
    <div class="px-4 py-6 bg-white border-b border-t border-grey-light flex flex-col">
      <div class="mb-8">
        <input v-model="predicate.name" type="text" class="text-input" placeholder="Custom filter name" />
      </div>
      <PredicateEditor v-model="predicate.body"></PredicateEditor>
      <div class="mt-8">
        <button class="btn btn-brand" @click="saveCurrentPredicate(predicate)">Save</button>
      </div>
    </div>
  </VueModal>
</template>
<script>
import { mapActions } from 'vuex'
import PredicateEditor from '@/components/dashboard/predicate-editor/Index'
export default {
  components: {
    PredicateEditor
  },
  data() {
    return {
      predicate: {
        name: '',
        body: JSON.stringify({
          groups: [
            {
              logicalType: 'any',
              predicates: [
                {
                  targets: [
                    { label: 'Repository Name', key: 'nameWithOwner' },
                    { label: 'Repository Description', key: 'description' }
                  ],
                  selectedTarget: 'nameWithOwner',
                  operator: 'is',
                  argument: ''
                }
              ]
            }
          ]
        })
      }
    }
  },
  methods: {
    ...mapActions(['saveCurrentPredicate']),
    closeModal() {
      this.$modal.hide('predicate-modal')
    }
  }
}
</script>
