import { describe, expect, it } from 'vitest'

import {
  RepoSearchContext,
  SuggestionOption,
  filterSuggestions,
  freeTextWords,
  parsePendingInput,
  repoMatchesSearch,
  repoMatchesToken,
} from '@/utils/search'

const repo = (overrides: Partial<RepoSearchContext> = {}): RepoSearchContext => ({
  haystack: '',
  isArchived: false,
  primaryLanguage: null,
  tagNames: [],
  ...overrides,
})

const options = (...names: string[]): SuggestionOption[] => names.map(name => ({ count: null, name }))

describe('parsePendingInput', () => {
  it('treats input without a qualifier prefix as free text', () => {
    expect(parsePendingInput('vue framework')).toEqual({ freeText: 'vue framework', mode: 'text' })
  })

  it('treats an empty string as free text', () => {
    expect(parsePendingInput('')).toEqual({ freeText: '', mode: 'text' })
  })

  it('enters qualifier mode on tag: with an empty partial', () => {
    expect(parsePendingInput('tag:')).toEqual({ freeText: '', mode: 'qualifier', partial: '', qualifier: 'tag' })
  })

  it('matches qualifier keywords case-insensitively and preserves partial casing', () => {
    expect(parsePendingInput('TAG:Re')).toEqual({ freeText: '', mode: 'qualifier', partial: 'Re', qualifier: 'tag' })
  })

  it('parses lang: as the lang qualifier', () => {
    expect(parsePendingInput('lang:rust')).toMatchObject({ partial: 'rust', qualifier: 'lang' })
  })

  it('normalizes language: to the lang qualifier', () => {
    expect(parsePendingInput('language:rust')).toMatchObject({ partial: 'rust', qualifier: 'lang' })
  })

  it('parses is: as the is qualifier', () => {
    expect(parsePendingInput('is:arch')).toMatchObject({ partial: 'arch', qualifier: 'is' })
  })

  it('keeps text before the qualifier as free text', () => {
    expect(parsePendingInput('react tag:fr')).toEqual({
      freeText: 'react',
      mode: 'qualifier',
      partial: 'fr',
      qualifier: 'tag',
    })
  })

  it('preserves spaces inside the partial value', () => {
    expect(parsePendingInput('tag:my t')).toMatchObject({ partial: 'my t', qualifier: 'tag' })
  })

  it('uses the last qualifier prefix when several appear', () => {
    expect(parsePendingInput('tag:foo is:bar')).toEqual({
      freeText: 'tag:foo',
      mode: 'qualifier',
      partial: 'bar',
      qualifier: 'is',
    })
  })

  it('ignores unknown keywords before a colon', () => {
    expect(parsePendingInput('vue:')).toEqual({ freeText: 'vue:', mode: 'text' })
  })

  it('ignores a qualifier keyword embedded in a longer word', () => {
    expect(parsePendingInput('montag:foo')).toEqual({ freeText: 'montag:foo', mode: 'text' })
  })

  it('requires the colon to enter qualifier mode', () => {
    expect(parsePendingInput('is')).toEqual({ freeText: 'is', mode: 'text' })
  })
})

describe('freeTextWords', () => {
  it('lowercases and splits on whitespace', () => {
    expect(freeTextWords('Vue  Framework')).toEqual(['vue', 'framework'])
  })

  it('returns no words for empty or blank input', () => {
    expect(freeTextWords('')).toEqual([])
    expect(freeTextWords('   ')).toEqual([])
  })
})

describe('filterSuggestions', () => {
  it('returns all options minus committed ones when the partial is empty', () => {
    expect(filterSuggestions(options('vue', 'react'), '', ['react'])).toEqual(options('vue'))
  })

  it('excludes committed values case-insensitively', () => {
    expect(filterSuggestions(options('React'), '', ['react'])).toEqual([])
  })

  it('matches substrings case-insensitively', () => {
    expect(filterSuggestions(options('React', 'firebase'), 'REA', [])).toEqual(options('React'))
  })

  it('ranks prefix matches before substring-only matches', () => {
    expect(filterSuggestions(options('firebase-react', 'React'), 're', [])).toEqual(options('React', 'firebase-react'))
  })

  it('trims the partial before matching', () => {
    expect(filterSuggestions(options('React'), ' re', [])).toEqual(options('React'))
  })

  it('returns nothing when no option matches', () => {
    expect(filterSuggestions(options('vue'), 'zzz', [])).toEqual([])
  })
})

describe('repoMatchesToken', () => {
  it('matches tag tokens against tag names case-insensitively and exactly', () => {
    const context = repo({ tagNames: ['vue', 'animation'] })

    expect(repoMatchesToken({ type: 'tag', value: 'Vue' }, context)).toBe(true)
    expect(repoMatchesToken({ type: 'tag', value: 'vu' }, context)).toBe(false)
  })

  it('matches lang tokens against the primary language exactly', () => {
    expect(repoMatchesToken({ type: 'lang', value: 'TypeScript' }, repo({ primaryLanguage: 'typescript' }))).toBe(true)
    expect(repoMatchesToken({ type: 'lang', value: 'type' }, repo({ primaryLanguage: 'typescript' }))).toBe(false)
    expect(repoMatchesToken({ type: 'lang', value: 'typescript' }, repo())).toBe(false)
  })

  it('matches is:archived against the archived flag', () => {
    expect(repoMatchesToken({ type: 'is', value: 'archived' }, repo({ isArchived: true }))).toBe(true)
    expect(repoMatchesToken({ type: 'is', value: 'archived' }, repo())).toBe(false)
  })

  it('matches is:untagged when the repo has no tags', () => {
    expect(repoMatchesToken({ type: 'is', value: 'untagged' }, repo())).toBe(true)
    expect(repoMatchesToken({ type: 'is', value: 'untagged' }, repo({ tagNames: ['vue'] }))).toBe(false)
  })

  it('never matches unknown is: values', () => {
    expect(repoMatchesToken({ type: 'is', value: 'fork' }, repo({ isArchived: true, tagNames: [] }))).toBe(false)
  })
})

describe('repoMatchesSearch', () => {
  it('matches everything when there are no tokens or words', () => {
    expect(repoMatchesSearch([], [], repo())).toBe(true)
  })

  it('requires every word to appear in the haystack', () => {
    const context = repo({ haystack: 'syropian/astral organize your github stars' })

    expect(repoMatchesSearch([], ['github', 'stars'], context)).toBe(true)
    expect(repoMatchesSearch([], ['github', 'gitlab'], context)).toBe(false)
  })

  it('requires every token and every word to match', () => {
    const context = repo({ haystack: 'vuejs/core', primaryLanguage: 'typescript', tagNames: ['frontend'] })

    expect(repoMatchesSearch([{ type: 'tag', value: 'frontend' }], ['core'], context)).toBe(true)
    expect(repoMatchesSearch([{ type: 'tag', value: 'frontend' }], ['cli'], context)).toBe(false)
    expect(
      repoMatchesSearch(
        [
          { type: 'lang', value: 'typescript' },
          { type: 'tag', value: 'backend' },
        ],
        [],
        context
      )
    ).toBe(false)
  })
})
