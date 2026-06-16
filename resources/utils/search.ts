export const IS_VALUES = ['archived', 'untagged'] as const

export type SearchToken =
  | { type: 'is'; value: string }
  | { type: 'lang'; value: string }
  | { type: 'tag'; value: string }
  | { type: 'topic'; value: string }

export type QualifierType = SearchToken['type']

export type ParsedPending =
  | { mode: 'qualifier'; freeText: string; qualifier: QualifierType; partial: string }
  | { mode: 'text'; freeText: string }

export interface SuggestionOption {
  count: Nullable<number>
  name: string
}

export interface RepoSearchContext {
  haystack: string
  isArchived: boolean
  primaryLanguage: Nullable<string>
  tagNames: string[]
  topics: string[]
}

/**
 * Splits the raw input on the last `tag:` / `lang:` / `language:` / `topic:` / `is:`
 * prefix (at the start or after a space). Text before the prefix is live free text; text
 * after it is the partial qualifier value, spaces included (tag names may contain
 * spaces). `language` normalizes to `lang` and `topics` to `topic`. No prefix means the
 * whole input is free text.
 */
const matchQualifiers = (raw: string): RegExpMatchArray[] => [
  ...raw.matchAll(/(?:^|\s)(tag|language|lang|topics|topic|is):/gi),
]

const qualifierFromKeyword = (keyword: string): QualifierType => {
  const normalized = keyword.toLowerCase()

  return normalized === 'tag' ? 'tag' : normalized === 'is' ? 'is' : normalized.startsWith('topic') ? 'topic' : 'lang'
}

export const parsePendingInput = (raw: string): ParsedPending => {
  const match = matchQualifiers(raw).at(-1)

  if (!match || match.index === undefined) {
    return { freeText: raw, mode: 'text' }
  }

  return {
    freeText: raw.slice(0, match.index),
    mode: 'qualifier',
    partial: raw.slice(match.index + match[0].length),
    qualifier: qualifierFromKeyword(match[1]),
  }
}

export const freeTextWords = (freeText: string): string[] => {
  return freeText.toLowerCase().split(/\s+/).filter(Boolean)
}

/**
 * Case-insensitive substring filter over option names, excluding already-committed
 * values. Prefix matches rank before substring-only matches so the first result is
 * the best candidate to pre-highlight.
 */
export const filterSuggestions = (
  options: SuggestionOption[],
  partial: string,
  committed: string[]
): SuggestionOption[] => {
  const query = partial.trim().toLowerCase()
  const committedNames = new Set(committed.map(name => name.toLowerCase()))
  const available = options.filter(option => !committedNames.has(option.name.toLowerCase()))

  if (!query) {
    return available
  }

  const prefixMatches: SuggestionOption[] = []
  const substringMatches: SuggestionOption[] = []

  for (const option of available) {
    const name = option.name.toLowerCase()

    if (name.startsWith(query)) {
      prefixMatches.push(option)
    } else if (name.includes(query)) {
      substringMatches.push(option)
    }
  }

  return [...prefixMatches, ...substringMatches]
}

export const repoMatchesToken = (token: SearchToken, repo: RepoSearchContext): boolean => {
  const value = token.value.toLowerCase()

  switch (token.type) {
    case 'is':
      if (value === 'archived') return repo.isArchived
      if (value === 'untagged') return repo.tagNames.length === 0

      return false
    case 'lang':
      return repo.primaryLanguage === value
    case 'tag':
      return repo.tagNames.includes(value)
    case 'topic':
      return repo.topics.includes(value)
    default: {
      const exhaustive: never = token

      return exhaustive
    }
  }
}

export const repoMatchesSearch = (tokens: SearchToken[], words: string[], repo: RepoSearchContext): boolean => {
  return tokens.every(token => repoMatchesToken(token, repo)) && words.every(word => repo.haystack.includes(word))
}

const QUALIFIER_KEYWORDS: Record<QualifierType, string> = {
  is: 'is',
  lang: 'lang',
  tag: 'tag',
  topic: 'topic',
}

export interface ParsedSearch {
  freeText: string
  tokens: SearchToken[]
}

/**
 * Serializes committed tokens and free text into the qualifier syntax used in the
 * `?search=` URL param, e.g. `react tag:rust topic:cli`. Free text comes first so
 * a token value can safely contain spaces (it runs up to the next qualifier).
 */
export const serializeSearch = (tokens: SearchToken[], freeText: string): string => {
  const parts: string[] = []
  const text = freeText.trim()

  if (text) {
    parts.push(text)
  }

  for (const token of tokens) {
    parts.push(`${QUALIFIER_KEYWORDS[token.type]}:${token.value}`)
  }

  return parts.join(' ')
}

/**
 * Inverse of `serializeSearch`: pulls out the leading free text and every
 * `qualifier:value` token. A value extends to the next qualifier, so multi-word
 * languages and tags survive the round trip.
 */
export const parseSearchString = (raw: string): ParsedSearch => {
  const matches = matchQualifiers(raw)

  if (!matches.length) {
    return { freeText: raw.trim(), tokens: [] }
  }

  const tokens: SearchToken[] = []

  matches.forEach((match, index) => {
    const valueStart = (match.index ?? 0) + match[0].length
    const valueEnd = index + 1 < matches.length ? matches[index + 1].index ?? raw.length : raw.length
    const value = raw.slice(valueStart, valueEnd).trim()

    if (value) {
      tokens.push({ type: qualifierFromKeyword(match[1]), value } as SearchToken)
    }
  })

  return { freeText: raw.slice(0, matches[0].index ?? 0).trim(), tokens }
}
