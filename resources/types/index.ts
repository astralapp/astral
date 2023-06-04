import { Ref } from 'vue'

export type TagEditorTag = Pick<App.Data.TagData, 'id' | 'name'>

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
  releases?: {
    edges: Array<{ node: { tagName: string } }>
  }
  stargazers: {
    totalCount: number
  }
  url: string
}

export interface GitHubRepo {
  cursor: string
  node: GitHubRepoNode
}

export interface RepoLanguage {
  name: string
  count: number
}

export interface StarDragDataTransferData {
  tag: App.Data.TagData
  repos: StarMetaInput[]
}

export interface PaginationResponse {
  startCursor: Nullable<string>
  endCursor: Nullable<string>
  hasNextPage: boolean
}

export const FetchDirection = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const
export type FetchDirection = Values<typeof FetchDirection>

export enum Ability {
  CREATE_TAG = 'create_tag',
  CREATE_SMART_FILTER = 'create_smart_filter',
  ADD_NOTES = 'add_notes',
}

export type Authorizations = Record<Ability, boolean>

export enum Limit {
  MAX_TAGS = 'max_tags',
}

export type Limits = Record<Limit, number>

export type TagSortMethod = keyof Pick<App.Data.TagData, 'stars_count' | 'name'>

// export enum AuthScope {
//   READ_USER = 'read:user',
//   PUBLIC_REPO = 'public_repo',
// }

export interface BaseDialogReturnType {
  isOpen: Ref<boolean>
  show(): void
  hide(): void
}

export type StarMetaInput = Pick<GitHubRepoNode, 'databaseId' | 'nameWithOwner' | 'url' | 'description'>
