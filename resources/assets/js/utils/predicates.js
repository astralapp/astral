export const defaultPredicate = {
  selectedTarget: 'node.nameWithOwner',
  operator: 'is',
  argument: ''
}

export const defaultGroup = {
  logicalType: 'any',
  predicates: [{ ...defaultPredicate }]
}

const stringOperators = [
  { key: 'is', label: 'is' },
  { key: 'contains', label: 'contains' },
  { key: 'notContains', label: "doesn't contain" },
  { key: 'isnt', label: "isn't" }
]

const numberOperators = [
  { key: 'greaterThan', label: '>' },
  { key: 'greaterThanOrEqualTo', label: '>=' },
  { key: 'equals', label: '=' },
  { key: 'lessThan', label: '<' },
  { key: 'lessThanOrEqualTo', label: '<=' }
]

const tagOperators = [
  { key: 'hasAnyTags', label: 'has any' },
  { key: 'hasAllTags', label: 'has all' },
  { key: 'hasNoneTags', label: 'has none' }
]

const languageOperators = [{ key: 'hasAnyLanguage', label: 'has any' }, { key: 'hasNoneLanguage', label: 'has none' }]

const stateOperators = [{ key: 'isState', label: 'is' }, { key: 'isntState', label: "isn't" }]

export const predicateTargets = [
  {
    label: 'Name',
    key: 'node.nameWithOwner',
    type: 'String',
    operators: stringOperators,
    defaultValue: ''
  },
  {
    label: 'Description',
    key: 'node.description',
    type: 'String',
    operators: stringOperators,
    defaultValue: ''
  },
  {
    label: 'Notes',
    key: 'notes',
    type: 'String',
    operators: stringOperators,
    defaultValue: ''
  },
  {
    label: 'Star Count',
    key: 'node.stargazers.totalCount',
    type: 'Number',
    operators: numberOperators,
    defaultValue: 0
  },
  {
    label: 'Tags',
    key: 'tags',
    type: 'Tags',
    operators: tagOperators,
    defaultValue: []
  },
  {
    label: 'Language',
    key: 'node.primaryLanguage.name',
    type: 'Language',
    operators: languageOperators,
    defaultValue: []
  },
  {
    label: 'State',
    type: 'State',
    key: 'astralRepoState',
    operators: stateOperators,
    defaultValue: { key: 'node.isArchived', label: 'archived' }
  }
]
