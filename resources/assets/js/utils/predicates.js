export const defaultPredicate = {
  selectedTarget: 'node.nameWithOwner',
  operator: 'is',
  argument: ''
}

export const predicateTargets = [
  {
    label: 'Name',
    key: 'node.nameWithOwner',
    type: 'String',
    operators: [{ key: 'is', label: 'is' }, { key: 'contains', label: 'contains' }, { key: 'isnt', label: "isn't" }],
    defaultValue: ''
  },
  {
    label: 'Description',
    key: 'node.description',
    type: 'String',
    operators: [{ key: 'is', label: 'is' }, { key: 'contains', label: 'contains' }, { key: 'isnt', label: "isn't" }],
    defaultValue: ''
  },
  {
    label: 'Star Count',
    key: 'node.stargazers.totalCount',
    type: 'Number',
    operators: [
      { key: 'greaterThan', label: '>' },
      { key: 'greaterThanOrEqualTo', label: '>=' },
      { key: 'equals', label: '=' },
      { key: 'lessThan', label: '<' },
      { key: 'lessThanOrEqualTo', label: '<=' }
    ],
    defaultValue: 0
  },
  {
    label: 'Tags',
    key: 'tags',
    type: 'Tags',
    operators: [
      { key: 'hasAnyTags', label: 'has any' },
      { key: 'hasAllTags', label: 'has all' },
      { key: 'hasNoneTags', label: 'has none' }
    ],
    defaultValue: []
  },
  {
    label: 'Language',
    key: 'language',
    type: 'Language',
    operators: [{ key: 'is', label: 'is' }, { key: 'isnt', label: "isn't" }],
    defaultValue: ''
  }
]
