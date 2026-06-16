import { Ref } from 'vue'

export type TagEditorTag = Pick<App.Data.TagData, 'id' | 'name'>

type MappedEnum<T extends string> = {
  [key in Uppercase<T>]: T
}

export const Ability = {
  ADD_NOTES: 'add_notes',
  CREATE_SMART_FILTER: 'create_smart_filter',
  CREATE_TAG: 'create_tag',
} as const

export interface GitHubRepo {
  cursor?: string
  node: GitHubRepoNode
}

export interface GitHubRepoNode {
  databaseId: number
  defaultBranchRef: {
    name: string
  }
  description?: string
  forkCount: number
  id: string
  isArchived: boolean
  nameWithOwner: string
  primaryLanguage: Nullable<{ name: string }>
  pushedAt: string
  releases?: {
    edges: Array<{ node: { tagName: string } }>
  }
  stargazerCount: number
  topics?: string[]
  url: string
}

export type Limits = Record<App.Data.Enums.Limit, number>

export interface PaginationResponse {
  endCursor: Nullable<string>
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: Nullable<string>
}

export interface RepoLanguage {
  count: number
  name: string
}

export interface StarDragDataTransferData {
  repos: StarMetaInput[]
  tag: App.Data.TagData
}

export const Limit: MappedEnum<App.Data.Enums.Limit> = {
  MAX_TAGS: 'max_tags',
} as const

export const FetchDirection = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const
export type FetchDirection = Values<typeof FetchDirection>

export const CursorDirection = {
  AFTER: 'after',
  BEFORE: 'before',
} as const
export type Authorizations = Record<App.Data.Enums.Ability, boolean>

export type CursorDirection = Values<typeof CursorDirection>

export type TagSortMethod = keyof Pick<App.Data.TagData, 'name' | 'stars_count'>

export const AuthScope = {
  PUBLIC_REPO: 'public_repo',
  READ_USER: 'read:user',
} as const
export type AuthScope = Values<typeof AuthScope>

export interface BaseDialogReturnType {
  hide(): void
  isOpen: Ref<boolean>
  show(): void
}

export type Errors = Record<string, string>

export type SettingsTab = 'data-controls' | 'general' | 'shortcuts'

export type StarMetaInput = Pick<GitHubRepoNode, 'databaseId' | 'description' | 'nameWithOwner' | 'url'>
