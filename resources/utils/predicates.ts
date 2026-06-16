import { GitHubRepo, RepoLanguage } from '@/types'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'

export interface Predicate {
  argument: unknown
  operator: string
  selectedTarget: string
}

export interface PredicateGroup {
  logicalType: 'all' | 'any' | 'none'
  predicates: Predicate[]
}

export interface SmartFilterBody {
  groups: PredicateGroup[]
}

export type PredicateOperatorCheck =
  | ((source: App.Data.TagData[], target: App.Data.TagData[]) => boolean)
  | ((source: number, target: number) => boolean)
  | ((source: string, target: RepoLanguage[]) => boolean)
  | ((source: string, target: string) => boolean)
  | ((source: string[], target: RepoLanguage[]) => boolean)
  | ((target: number | string) => boolean)

export interface PredicateOperator {
  check: PredicateOperatorCheck
  key: string
  label: string
}

export type PredicateTargetType = 'Date' | 'Language' | 'Number' | 'State' | 'String' | 'Tags' | 'Topics'

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
  : T extends 'Topics'
  ? RepoLanguage[]
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
    label: 'greater than',
  },
  {
    check: (source: number, target: number) => Number(source) >= Number(target),
    key: 'greaterThanOrEqualTo',
    label: 'at least',
  },
  { check: (source: number, target: number) => Number(source) === Number(target), key: 'equals', label: 'equals' },
  { check: (source: number, target: number) => Number(source) < Number(target), key: 'lessThan', label: 'less than' },
  {
    check: (source: number, target: number) => Number(source) <= Number(target),
    key: 'lessThanOrEqualTo',
    label: 'at most',
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

export const topicOperators: PredicateOperator[] = [
  {
    check: (source: string[], target: RepoLanguage[]) => {
      if (source === undefined) {
        return false
      }

      const topics = source.map(topic => topic.toLowerCase())

      return target.map(t => t.name.toLowerCase()).some(val => topics.includes(val))
    },
    key: 'hasAnyTopics',
    label: 'has any',
  },
  {
    check: (source: string[], target: RepoLanguage[]) => {
      if (source === undefined) {
        return false
      }

      const topics = source.map(topic => topic.toLowerCase())

      return target.map(t => t.name.toLowerCase()).every(val => topics.includes(val))
    },
    key: 'hasAllTopics',
    label: 'has all',
  },
  {
    check: (source: string[], target: RepoLanguage[]) => {
      if (source === undefined) {
        return false
      }

      const topics = source.map(topic => topic.toLowerCase())

      return !target.map(t => t.name.toLowerCase()).some(val => topics.includes(val))
    },
    key: 'hasNoneTopics',
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
    keyPath: 'node.stargazerCount',
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
    defaultValue: [] as RepoLanguage[],
    keyPath: 'node.topics',
    label: 'Topics',
    operators: topicOperators,
    type: 'Topics',
  } as PredicateTarget<'Topics'>,
  {
    defaultValue: { key: 'node.isArchived', label: 'archived' },
    keyPath: 'astralRepoState',
    label: 'State',
    operators: stateOperators,
    type: 'State',
  } as PredicateTarget<'State'>,
  {
    defaultValue: '',
    keyPath: 'node.pushedAt',
    label: 'Updated at',
    operators: dateOperators,
    type: 'Date',
  } as PredicateTarget<'Date'>,
]

const predicateTargetsByKeyPath = new Map(predicateTargets.map(target => [target.keyPath, target]))

export const predicateOperators: PredicateOperator[] = [
  ...stringOperators,
  ...numberOperators,
  ...tagOperators,
  ...dateOperators,
  ...languageOperators,
  ...topicOperators,
  ...stateOperators,
]

const predicateOperatorsByKey = new Map(predicateOperators.map(operator => [operator.key, operator]))

export const createDefaultPredicate = (): Predicate => {
  return cloneDeep(defaultPredicate)
}

export const createDefaultGroup = (): PredicateGroup => {
  return {
    logicalType: defaultGroup.logicalType,
    predicates: [createDefaultPredicate()],
  }
}

export const createDefaultFilterBody = (): SmartFilterBody => {
  return {
    groups: [createDefaultGroup()],
  }
}

export const getPredicateTarget = (selectedTarget: string): PredicateTarget<PredicateTargetType> => {
  return (predicateTargetsByKeyPath.get(selectedTarget) as PredicateTarget<PredicateTargetType>) ?? predicateTargets[0]
}

export const getOperatorsForPredicate = (predicate: Predicate): PredicateOperator[] => {
  return getPredicateTarget(predicate.selectedTarget).operators
}

export const applyPredicateTarget = (predicate: Predicate, selectedTarget: string): void => {
  const target = getPredicateTarget(selectedTarget)

  predicate.selectedTarget = target.keyPath
  predicate.operator = target.operators[0]?.key ?? ''

  if (target.defaultValue !== undefined) {
    predicate.argument = cloneDeep(target.defaultValue)
  }
}

export const normalizePredicate = (predicate: Partial<Predicate>): Predicate => {
  const target = getPredicateTarget(String(predicate.selectedTarget || defaultPredicate.selectedTarget))
  const argument =
    predicate.argument !== undefined
      ? cloneDeep(predicate.argument)
      : target.defaultValue !== undefined
      ? cloneDeep(target.defaultValue)
      : undefined

  return {
    argument,
    operator: target.operators.some(operator => operator.key === predicate.operator)
      ? String(predicate.operator)
      : target.operators[0]?.key ?? '',
    selectedTarget: target.keyPath,
  }
}

export const normalizeGroup = (group: Partial<PredicateGroup>): PredicateGroup => {
  const logicalType = group.logicalType === 'all' || group.logicalType === 'none' ? group.logicalType : 'any'
  const predicates = Array.isArray(group.predicates)
    ? group.predicates.map(predicate => normalizePredicate(predicate as Partial<Predicate>))
    : [createDefaultPredicate()]

  return {
    logicalType,
    predicates: predicates.length ? predicates : [createDefaultPredicate()],
  }
}

export const parseSmartFilterBody = (value: string): SmartFilterBody => {
  try {
    const parsed = JSON.parse(value) as Partial<SmartFilterBody>

    if (!Array.isArray(parsed.groups) || !parsed.groups.length) {
      return createDefaultFilterBody()
    }

    return {
      groups: parsed.groups.map(group => normalizeGroup(group as Partial<PredicateGroup>)),
    }
  } catch {
    return createDefaultFilterBody()
  }
}

export const stringifySmartFilterBody = (body: SmartFilterBody): string => {
  return JSON.stringify(body)
}

export const evaluatePredicate = (
  predicate: Predicate,
  repo: GitHubRepo,
  userStar: Maybe<App.Data.StarData> = undefined
): boolean => {
  const operator = predicateOperatorsByKey.get(predicate.operator)

  if (!operator) {
    return false
  }

  if (predicate.selectedTarget === 'tags') {
    if (!userStar) {
      return false
    }

    return (operator.check as (source: App.Data.TagData[], target: App.Data.TagData[]) => boolean)(
      userStar.tags,
      predicate.argument as App.Data.TagData[]
    )
  }

  const repoKeyValue = get(repo, predicate.selectedTarget)

  if (repoKeyValue !== undefined && repoKeyValue !== null) {
    return (operator.check as (source: unknown, target: unknown) => boolean)(repoKeyValue, predicate.argument)
  }

  if (typeof predicate.argument === 'object' && predicate.argument !== null && 'key' in predicate.argument) {
    const argumentKeyPath = (predicate.argument as { key: string }).key

    return (operator.check as (target: number | string) => boolean)(get(repo, argumentKeyPath))
  }

  return false
}

export const evaluateGroup = (group: PredicateGroup, predicateCheck: (predicate: Predicate) => boolean): boolean => {
  if (group.logicalType === 'all') {
    return group.predicates.every(predicateCheck)
  }

  if (group.logicalType === 'none') {
    return !group.predicates.some(predicateCheck)
  }

  return group.predicates.some(predicateCheck)
}

export const evaluateSmartFilterBody = (
  body: SmartFilterBody,
  repo: GitHubRepo,
  userStar: Maybe<App.Data.StarData> = undefined
): boolean => {
  return body.groups.every(group => evaluateGroup(group, predicate => evaluatePredicate(predicate, repo, userStar)))
}
