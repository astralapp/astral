import { RepoLanguage, Tag } from '@/scripts/types'

export interface Predicate {
  selectedTarget: string
  operator: string
  argument: unknown
}

export interface PredicateGroup {
  logicalType: 'any' | 'all' | 'none'
  predicates: Predicate[]
}

type PredicateOperatorCheck =
  | ((target: string | number) => boolean)
  | ((source: string, target: string) => boolean)
  | ((source: number, target: number) => boolean)
  | ((source: Tag[], target: Tag[]) => boolean)
  | ((source: string, target: RepoLanguage[]) => boolean)

export interface PredicateOperator {
  key: string
  label: string
  check: PredicateOperatorCheck
}

export type PredicateTargetType = 'String' | 'Number' | 'State' | 'Tags' | 'Language' | 'Date'

export interface PredicateTarget<T> {
  label: string
  key: string
  type: PredicateTargetType
  operators: PredicateOperator[]
  defaultValue?: T
}

export const defaultPredicate: Predicate = {
  selectedTarget: 'node.nameWithOwner',
  operator: 'is',
  argument: '',
}

export const defaultGroup: PredicateGroup = {
  logicalType: 'any',
  predicates: [{ ...defaultPredicate }],
}

export const stringOperators: PredicateOperator[] = [
  {
    key: 'is',
    label: 'is',
    check: (source: string, target: string) => source.trim().toLowerCase() === target.trim().toLowerCase(),
  },
  {
    key: 'isnt',
    label: "isn't",
    check: (source: string, target: string) => source.trim().toLowerCase() !== target.trim().toLowerCase(),
  },
  {
    key: 'contains',
    label: 'contains',
    check: (source: string, substring: string) => source.trim().toLowerCase().includes(substring.trim().toLowerCase()),
  },
  {
    key: 'notContains',
    label: "doesn't contain",
    check: (source: string, substring: string) => !source.trim().toLowerCase().includes(substring.trim().toLowerCase()),
  },
]

export const numberOperators: PredicateOperator[] = [
  {
    key: 'greaterThan',
    label: '>',
    check: (source: number, target: number) => Number(source) > Number(target),
  },
  {
    key: 'greaterThanOrEqualTo',
    label: '>=',
    check: (source: number, target: number) => Number(source) >= Number(target),
  },
  { key: 'equals', label: '=', check: (source: number, target: number) => Number(source) === Number(target) },
  { key: 'lessThan', label: '<', check: (source: number, target: number) => Number(source) < Number(target) },
  {
    key: 'lessThanOrEqualTo',
    label: '<=',
    check: (source: number, target: number) => Number(source) >= Number(target),
  },
]

export const tagOperators: PredicateOperator[] = [
  {
    key: 'hasAnyTags',
    label: 'has any',
    check: (source: Tag[], target: Tag[]) => {
      if (source === undefined) {
        return false
      }

      return target.map(t => t.name).some(val => source.map(t => t.name).includes(val))
    },
  },
  {
    key: 'hasAllTags',
    label: 'has all',
    check: (source: Tag[], target: Tag[]) => {
      if (source === undefined) {
        return false
      }

      return target.map(t => t.name).every(val => source.map(t => t.name).includes(val))
    },
  },
  {
    key: 'hasNoneTags',
    label: 'has none',
    check: (source: Tag[], target: Tag[]) => {
      if (source === undefined) {
        return false
      }

      return !target.map(t => t.name).some(val => source.map(t => t.name).includes(val))
    },
  },
]

export const dateOperators: PredicateOperator[] = [
  {
    key: 'before',
    label: 'before',
    check: (source: string, target: string) => new Date(source).getTime() < new Date(target).getTime(),
  },
  {
    key: 'after',
    label: 'after',
    check: (source: string, target: string) => new Date(source).getTime() > new Date(target).getTime(),
  },
]

export const languageOperators: PredicateOperator[] = [
  {
    key: 'hasAnyLanguage',
    label: 'has any',
    check: (source: string, target: RepoLanguage[]) => {
      if (source === undefined) {
        return false
      }

      return target.map(l => l.name).includes(source)
    },
  },
  {
    key: 'hasNoneLanguage',
    label: 'has none',
    check: (source: string, target: RepoLanguage[]) => {
      if (source === undefined) {
        return false
      }

      return !target.map(l => l.name).includes(source)
    },
  },
]

export const stateOperators: PredicateOperator[] = [
  { key: 'isState', label: 'is', check: (target: string | number) => Boolean(target) === true },
  { key: 'isntState', label: "isn't", check: (target: string | number) => Boolean(target) === false },
]

export const predicateTargets: PredicateTarget<string | Tag[] | RepoLanguage[] | Record<string, string>>[] = [
  {
    label: 'Name',
    key: 'node.nameWithOwner',
    type: 'String',
    operators: stringOperators,
    defaultValue: '',
  },
  {
    label: 'Description',
    key: 'node.description',
    type: 'String',
    operators: stringOperators,
    defaultValue: '',
  },
  {
    label: 'Notes',
    key: 'notes',
    type: 'String',
    operators: stringOperators,
    defaultValue: '',
  },
  {
    label: 'Star count',
    key: 'node.stargazers.totalCount',
    type: 'Number',
    operators: numberOperators,
    defaultValue: '0',
  },
  {
    label: 'Tags',
    key: 'tags',
    type: 'Tags',
    operators: tagOperators,
    defaultValue: [] as Tag[],
  },
  {
    label: 'Language',
    key: 'node.primaryLanguage.name',
    type: 'Language',
    operators: languageOperators,
    defaultValue: [] as RepoLanguage[],
  },
  {
    label: 'State',
    type: 'State',
    key: 'astralRepoState',
    operators: stateOperators,
    defaultValue: { key: 'node.isArchived', label: 'archived' },
  },
  {
    label: 'Updated at',
    type: 'Date',
    key: 'node.pushedAt',
    operators: dateOperators,
  },
]
