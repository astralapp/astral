import { describe, expect, it } from 'vitest'

import { GitHubRepo } from '@/types'
import {
  evaluatePredicate,
  evaluateSmartFilterBody,
  getPredicateTarget,
  parseSmartFilterBody,
  Predicate,
} from '@/utils/predicates'

const repoWithTopics = (topics: string[]): GitHubRepo => ({
  node: {
    databaseId: 1,
    defaultBranchRef: { name: 'main' },
    forkCount: 0,
    id: 'node-id',
    isArchived: false,
    nameWithOwner: 'owner/repo',
    primaryLanguage: null,
    pushedAt: '',
    stargazerCount: 0,
    topics,
    url: '',
  },
})

const topicPredicate = (operator: string, names: string[]): Predicate => ({
  argument: names.map(name => ({ count: 0, name })),
  operator,
  selectedTarget: 'node.topics',
})

describe('Legacy smart-filter target aliases', () => {
  // Body as stored by the old app; star count was the raw GraphQL path back then.
  const legacyStarCountBody =
    '{"groups":[{"logicalType":"any","predicates":[{"selectedTarget":"node.stargazers.totalCount","operator":"greaterThan","argument":20}]}]}'

  it('resolves the legacy star-count keyPath to the current target', () => {
    expect(getPredicateTarget('node.stargazers.totalCount').keyPath).toBe('node.stargazerCount')
    expect(getPredicateTarget('node.stargazers.totalCount').label).toBe('Star count')
  })

  it('normalizes a migrated star-count filter to the canonical key, preserving operator and argument', () => {
    const predicate = parseSmartFilterBody(legacyStarCountBody).groups[0].predicates[0]

    expect(predicate.selectedTarget).toBe('node.stargazerCount')
    expect(predicate.operator).toBe('greaterThan')
    expect(predicate.argument).toBe(20)
  })

  it('evaluates a migrated star-count filter against the flattened repo field', () => {
    const body = parseSmartFilterBody(legacyStarCountBody)
    const repo = (count: number): GitHubRepo => ({ node: { ...repoWithTopics([]).node, stargazerCount: count } })

    expect(evaluateSmartFilterBody(body, repo(25))).toBe(true)
    expect(evaluateSmartFilterBody(body, repo(10))).toBe(false)
  })
})

describe('Topics smart-filter target', () => {
  it('exposes the has any / all / none operators', () => {
    expect(getPredicateTarget('node.topics').operators.map(operator => operator.key)).toEqual([
      'hasAnyTopics',
      'hasAllTopics',
      'hasNoneTopics',
    ])
  })

  it('hasAny matches when at least one topic overlaps', () => {
    expect(evaluatePredicate(topicPredicate('hasAnyTopics', ['cli', 'gui']), repoWithTopics(['cli', 'terminal']))).toBe(
      true
    )
    expect(evaluatePredicate(topicPredicate('hasAnyTopics', ['gui']), repoWithTopics(['cli']))).toBe(false)
  })

  it('hasAll requires every selected topic to be present', () => {
    expect(
      evaluatePredicate(topicPredicate('hasAllTopics', ['cli', 'terminal']), repoWithTopics(['cli', 'terminal', 'tui']))
    ).toBe(true)
    expect(evaluatePredicate(topicPredicate('hasAllTopics', ['cli', 'gui']), repoWithTopics(['cli']))).toBe(false)
  })

  it('hasNone matches only when no topic overlaps', () => {
    expect(evaluatePredicate(topicPredicate('hasNoneTopics', ['gui']), repoWithTopics(['cli']))).toBe(true)
    expect(evaluatePredicate(topicPredicate('hasNoneTopics', ['cli']), repoWithTopics(['cli']))).toBe(false)
    expect(evaluatePredicate(topicPredicate('hasNoneTopics', ['cli']), repoWithTopics([]))).toBe(true)
  })

  it('matches topics case-insensitively', () => {
    expect(evaluatePredicate(topicPredicate('hasAnyTopics', ['CLI']), repoWithTopics(['cli']))).toBe(true)
  })
})
