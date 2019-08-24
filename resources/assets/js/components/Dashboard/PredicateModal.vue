<template>
  <VueModal name="predicate-modal" height="auto" :width="768" @before-close="resetPredicateState">
    <div class="flex items-center justify-between px-4 py-3 bg-grey-lightest leading-none">
      <h3>{{ modalTitle }}</h3>
      <button
        class="inline-flex justify-center items-center text-2xl focus-none rounded-full w-8 h-8 bg-transparent hover:bg-grey-light transition-bg"
        @click="closeModal"
      >
        &times;
      </button>
    </div>
    <div class="px-4 py-6 bg-white border-b border-t border-grey-light flex flex-col">
      <div class="flex items-center">
        <input v-model="predicate.name" type="text" class="text-input" placeholder="Custom filter name" />
        <p v-show="!!error" class="text-red ml-4">{{ error }}</p>
      </div>
      <PredicateEditor v-model="predicate.body"></PredicateEditor>
      <div class="mt-8 flex justify-end">
        <button class="btn btn-brand" :disabled="predicate.name.trim() === ''" @click="doSavePredicate()">Save</button>
      </div>
    </div>
  </VueModal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import PredicateEditor from '@/components/dashboard/predicate-editor/Index'
import { cloneDeep } from 'lodash'
import { defaultPredicate } from '@/utils/predicates'
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
              predicates: [cloneDeep(defaultPredicate)]
            }
          ]
        })
      },
      error: ''
    }
  },
  computed: {
    ...mapGetters(['editingPredicate']),
    isEditingPredicate() {
      return !!Object.keys(this.editingPredicate).length
    },
    modalTitle() {
      if (this.isEditingPredicate) {
        return this.editingPredicate.name
      } else {
        return 'Add a new filter'
      }
    }
  },
  watch: {
    editingPredicate() {
      if (this.isEditingPredicate) {
        this.predicate = cloneDeep(this.editingPredicate)
      }
    }
  },
  methods: {
    ...mapActions(['savePredicate', 'setEditingPredicate']),
    async doSavePredicate() {
      try {
        await this.savePredicate(this.predicate)
        this.error = ''
        if (!this.isEditingPredicate) {
          this.$bus.$emit('NOTIFICATION', `${this.predicate.name} filter added!`)
        }
        this.closeModal()
      } catch (e) {
        this.error = e.errors[Object.keys(e.errors)[0]][0]
      }
    },
    resetPredicateState() {
      this.setEditingPredicate({})
      this.error = ''
      this.predicate = {
        name: '',
        body: JSON.stringify({
          groups: [
            {
              logicalType: 'any',
              predicates: [cloneDeep(defaultPredicate)]
            }
          ]
        })
      }
    },
    closeModal() {
      this.$modal.hide('predicate-modal')
    }
  }
}
</script>
