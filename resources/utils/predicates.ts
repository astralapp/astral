import { RepoLanguage } from '@/types'

export interface Predicate {
  argument: unknown
  operator: string
  selectedTarget: string
}

export interface PredicateGroup {
  logicalType: 'all' | 'any' | 'none'
  predicates: Predicate[]
}

export type PredicateOperatorCheck =
  | ((source: App.Data.TagData[], target: App.Data.TagData[]) => boolean)
  | ((source: number, target: number) => boolean)
  | ((source: string, target: RepoLanguage[]) => boolean)
  | ((source: string, target: string) => boolean)
  | ((target: number | string) => boolean)

export interface PredicateOperator {
  check: PredicateOperatorCheck
  key: string
  label: string
}

export type PredicateTargetType = 'Date' | 'Language' | 'Number' | 'State' | 'String' | 'Tags'

type PredicateTargetDefault<T extends PredicateTargetType> = T extends 'Date'
  ? string
  : T extends 'Language'
  ? RepoLanguage[]
  : T extends 'Number'
  ? string
  : T extends 'State'
  ? { key: 'node.isArchived'; label: 'archived' }
  : T extends 'String'
  ? string
  : T extends 'Tags'
  ? App.Data.TagData[]
  : never

export interface PredicateTarget<T extends PredicateTargetType> {
  defaultValue?: PredicateTargetDefault<T>
  keyPath: string
  label: string
  operators: PredicateOperator[]
  type: T
}

export const defaultPredicate: Predicate = {
  argument: '',
  operator: 'is',
  selectedTarget: 'node.nameWithOwner',
}

export const defaultGroup: PredicateGroup = {
  logicalType: 'any',
  predicates: [{ ...defaultPredicate }],
}

export const stringOperators: PredicateOperator[] = [
  {
    check: (source: string, target: string) => source.trim().toLowerCase() === target.trim().toLowerCase(),
    key: 'is',
    label: 'is',
  },
  {
    check: (source: string, target: string) => source.trim().toLowerCase() !== target.trim().toLowerCase(),
    key: 'isnt',
    label: "isn't",
  },
  {
    check: (source: string, substring: string) => source.trim().toLowerCase().includes(substring.trim().toLowerCase()),
    key: 'contains',
    label: 'contains',
  },
  {
    check: (source: string, substring: string) => !source.trim().toLowerCase().includes(substring.trim().toLowerCase()),
    key: 'notContains',
    label: "doesn't contain",
  },
]

export const numberOperators: PredicateOperator[] = [
  {
    check: (source: number, target: number) => Number(source) > Number(target),
    key: 'greaterThan',
    label: '>',
  },
  {
    check: (source: number, target: number) => Number(source) >= Number(target),
    key: 'greaterThanOrEqualTo',
    label: '>=',
  },
  { check: (source: number, target: number) => Number(source) === Number(target), key: 'equals', label: '=' },
  { check: (source: number, target: number) => Number(source) < Number(target), key: 'lessThan', label: '<' },
  {
    check: (source: number, target: number) => Number(source) >= Number(target),
    key: 'lessThanOrEqualTo',
    label: '<=',
  },
]

export const tagOperators: PredicateOperator[] = [
  {
    check: (source: App.Data.TagData[], target: App.Data.TagData[]) => {
      if (source === undefined) {
        return false
      }

      return target.map(t => t.name).some(val => source.map(t => t.name).includes(val))
    },
    key: 'hasAnyTags',
    label: 'has any',
  },
  {
    check: (source: App.Data.TagData[], target: App.Data.TagData[]) => {
      if (source === undefined) {
        return false
      }

      return target.map(t => t.name).every(val => source.map(t => t.name).includes(val))
    },
    key: 'hasAllTags',
    label: 'has all',
  },
  {
    check: (source: App.Data.TagData[], target: App.Data.TagData[]) => {
      if (source === undefined) {
        return false
      }

      return !target.map(t => t.name).some(val => source.map(t => t.name).includes(val))
    },
    key: 'hasNoneTags',
    label: 'has none',
  },
]

export const dateOperators: PredicateOperator[] = [
  {
    check: (source: string, target: string) => new Date(source).getTime() < new Date(target).getTime(),
    key: 'before',
    label: 'before',
  },
  {
    check: (source: string, target: string) => new Date(source).getTime() > new Date(target).getTime(),
    key: 'after',
    label: 'after',
  },
]

export const languageOperators: PredicateOperator[] = [
  {
    check: (source: string, target: RepoLanguage[]) => {
      if (source === undefined) {
        return false
      }

      return target.map(l => l.name).includes(source)
    },
    key: 'hasAnyLanguage',
    label: 'has any',
  },
  {
    check: (source: string, target: RepoLanguage[]) => {
      if (source === undefined) {
        return false
      }

      return !target.map(l => l.name).includes(source)
    },
    key: 'hasNoneLanguage',
    label: 'has none',
  },
]

export const stateOperators: PredicateOperator[] = [
  { check: (target: number | string) => Boolean(target) === true, key: 'isState', label: 'is' },
  { check: (target: number | string) => Boolean(target) === false, key: 'isntState', label: "isn't" },
]

export const predicateTargets = [
  {
    defaultValue: '',
    keyPath: 'node.nameWithOwner',
    label: 'Name',
    operators: stringOperators,
    type: 'String',
  } as PredicateTarget<'String'>,
  {
    defaultValue: '',
    keyPath: 'node.description',
    label: 'Description',
    operators: stringOperators,
    type: 'String',
  } as PredicateTarget<'String'>,
  {
    defaultValue: '',
    keyPath: 'notes',
    label: 'Notes',
    operators: stringOperators,
    type: 'String',
  } as PredicateTarget<'String'>,
  {
    defaultValue: '0',
    keyPath: 'node.stargazers.totalCount',
    label: 'Star count',
    operators: numberOperators,
    type: 'Number',
  } as PredicateTarget<'Number'>,
  {
    defaultValue: [] as App.Data.TagData[],
    keyPath: 'tags',
    label: 'Tags',
    operators: tagOperators,
    type: 'Tags',
  } as PredicateTarget<'Tags'>,
  {
    defaultValue: [] as RepoLanguage[],
    keyPath: 'node.primaryLanguage.name',
    label: 'Language',
    operators: languageOperators,
    type: 'Language',
  } as PredicateTarget<'Language'>,
  {
    defaultValue: { key: 'node.isArchived', label: 'archived' },
    keyPath: 'astralRepoState',
    label: 'State',
    operators: stateOperators,
    type: 'State',
  } as PredicateTarget<'State'>,
  {
    keyPath: 'node.pushedAt',
    label: 'Updated at',
    operators: dateOperators,
    type: 'Date',
  } as PredicateTarget<'Date'>,
]
