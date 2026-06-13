export const IS_VALUES = ['archived', 'untagged'] as const

export type SearchToken =
  | { type: 'is'; value: string }
  | { type: 'lang'; value: string }
  | { type: 'tag'; value: string }

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
}

/**
 * Splits the raw input on the last `tag:` / `lang:` / `language:` / `is:` prefix
 * (at the start or after a space). Text before the prefix is live free text; text
 * after it is the partial qualifier value, spaces included (tag names may contain
 * spaces). `language` normalizes to `lang`. No prefix means the whole input is free text.
 */
export const parsePendingInput = (raw: string): ParsedPending => {
  const match = [...raw.matchAll(/(?:^|\s)(tag|language|lang|is):/gi)].at(-1)

  if (!match || match.index === undefined) {
    return { freeText: raw, mode: 'text' }
  }

  const keyword = match[1].toLowerCase()
  const qualifier: QualifierType = keyword === 'tag' ? 'tag' : keyword === 'is' ? 'is' : 'lang'

  return {
    freeText: raw.slice(0, match.index),
    mode: 'qualifier',
    partial: raw.slice(match.index + match[0].length),
    qualifier,
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
    default: {
      const exhaustive: never = token

      return exhaustive
    }
  }
}

export const repoMatchesSearch = (tokens: SearchToken[], words: string[], repo: RepoSearchContext): boolean => {
  return tokens.every(token => repoMatchesToken(token, repo)) && words.every(word => repo.haystack.includes(word))
}
