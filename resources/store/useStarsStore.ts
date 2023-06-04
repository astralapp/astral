import { defineStore } from 'pinia'
import { router } from '@inertiajs/core'
import { useUserStore } from '@/scripts/store/useUserStore'
import { useStarsFilterStore } from '@/scripts/store/useStarsFilterStore'
import { fetchStarsQuery, removeStarQuery } from '@/scripts/queries'
import keyBy from 'lodash/keyBy'
import { Dictionary, every, some, reject, get } from 'lodash'
import {
  UserStar,
  GitHubRepo,
  GitHubRepoNode,
  RepoLanguage,
  PaginationResponse,
  FetchDirection,
  StarMetaInput,
  TagEditorTag,
  Tag,
} from '@/scripts/types'
import {
  PredicateGroup,
  Predicate,
  stringOperators,
  numberOperators,
  tagOperators,
  dateOperators,
  languageOperators,
  stateOperators,
  PredicateOperator,
  PredicateTarget,
} from '@/scripts/utils/predicates'

type LogicalOperatorFunction = (predicates: Predicate[], predicateCheck: (predicate: Predicate) => boolean) => boolean

export const useStarsStore = defineStore({
  id: 'stars',
  state() {
    return {
      isDraggingRepo: false,
      userStars: [] as UserStar[],
      starredRepos: [] as GitHubRepo[],
      pageInfo: {
        startCursor: null,
        endCursor: null,
        hasNextPage: true,
      } as PaginationResponse,
      totalRepos: 0,
      selectedRepos: [] as GitHubRepoNode[],
      draggingRepos: [] as GitHubRepoNode[],
      hasFetchedFromStorage: false,
      isFetchingStars: false,
    }
  },
  getters: {
    userStarsByRepoId(): Dictionary<UserStar> {
      return keyBy(this.userStars, (star: UserStar) => `${star.repo_id}`)
    },
    allStars(): GitHubRepo[] {
      return this.starredRepos
    },
    untaggedStars(): GitHubRepo[] {
      return this.allStars.filter(repo => {
        const userStar: UserStar = this.userStarsByRepoId[repo.node.databaseId]

        return !userStar || !userStar.tags?.length
      })
    },
    filteredRepos(): GitHubRepo[] {
      const starsFilterStore = useStarsFilterStore()
      const selectedTag = starsFilterStore.selectedTag

      let filteredRepos = starsFilterStore.isFilteringByUntagged ? this.untaggedStars : this.allStars

      if (starsFilterStore.isFilteringByTag || starsFilterStore.isFilteringByLanguage) {
        if (starsFilterStore.isFilteringByTag) {
          filteredRepos = filteredRepos.filter(repo => {
            const userStar = this.userStarsByRepoId[repo.node.databaseId]

            return !!userStar && !!selectedTag && userStar.tags.map(tag => tag.id).includes(selectedTag.id)
          })
        }

        if (starsFilterStore.isFilteringByLanguage) {
          filteredRepos = filteredRepos.filter(
            (repo: GitHubRepo) => repo.node.primaryLanguage?.name === starsFilterStore.selectedLanguage
          )
        }
      }

      if (starsFilterStore.isFilteringBySmartFilter && starsFilterStore.selectedSmartFilter) {
        const predicate = JSON.parse(starsFilterStore.selectedSmartFilter.body)

        const logicalTypeMap = {
          any: some,
          all: every,
          none: reject,
        } as const

        const operators: PredicateOperator[] = [
          ...stringOperators,
          ...numberOperators,
          ...tagOperators,
          ...dateOperators,
          ...languageOperators,
          ...stateOperators,
        ]

        filteredRepos = this.allStars.filter(repo => {
          return predicate.groups.every((group: PredicateGroup) => {
            return (get(logicalTypeMap, group.logicalType) as LogicalOperatorFunction)(
              group.predicates,
              (p: Predicate) => {
                const operator: Maybe<PredicateOperator> = operators.find(o => o.key === p.operator)
                if (operator) {
                  if (p.selectedTarget === 'tags') {
                    const userStar = this.userStarsByRepoId[repo.node.databaseId]
                    if (!userStar) return false

                    const tags = userStar.tags

                    return operator.check(tags, p.argument as Tag[])
                  } else {
                    if (get(repo, p.selectedTarget)) {
                      return operator.check(get(repo, p.selectedTarget), p.argument)
                    } else {
                      return operator.check(get(repo, (p.argument as PredicateTarget).key))
                    }
                  }
                } else {
                  return false
                }
              }
            )
          })
        })
      }

      if (starsFilterStore.isFilteringBySearch) {
        const search = starsFilterStore.search

        filteredRepos = filteredRepos.filter((repo: GitHubRepo) => {
          const starNotes = this.userStarsByRepoId[repo.node.databaseId]?.notes || ''
          const repoTextHaystack = [repo.node.nameWithOwner, repo.node.description, starNotes]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          const repoHasStringMatches = search.strings.every(searchString => repoTextHaystack.includes(searchString))

          if (search.tags.length) {
            const repoTagNames = (this.userStarsByRepoId[repo.node.databaseId]?.tags || []).map(tag =>
              tag.name.toLowerCase()
            )
            const repoHasTagMatches = search.tags.every(tag => repoTagNames.includes(tag))

            return repoHasTagMatches && repoHasStringMatches
          } else {
            return repoHasStringMatches
          }
        })
      }

      return filteredRepos
    },
    languages(): RepoLanguage[] {
      return Object.entries(
        this.allStars
          .map(repo => {
            return repo.node.primaryLanguage?.name || ''
          })
          .filter(Boolean)
          .reduce((totals: Record<string, number>, lang: string): Record<string, number> => {
            return { ...totals, [lang]: (totals[lang] || 0) + 1 }
          }, {})
      )
        .map((language: [string, number]) => {
          const [name, count] = language

          return {
            name,
            count,
          }
        })
        .sort((a, b) => b.count - a.count)
    },
    selectedRepo(): GitHubRepoNode {
      return this.selectedRepos[0] || {}
    },
    isAnyRepoSelected(): boolean {
      return !!Object.keys(this.selectedRepo).length
    },
  },
  actions: {
    async fetchStars(cursor: Nullable<string> = null, direction: FetchDirection = FetchDirection.DESC) {
      this.isFetchingStars = true

      const userStore = useUserStore()
      const result = await (
        await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            Authorization: `bearer ${userStore.user?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: fetchStarsQuery(cursor, direction),
          }),
        })
      ).json()

      return result.data
    },
    addTagToStars(tagId: number, repos: StarMetaInput[]) {
      router.post('/stars/tag', { tagId, repos } as any, { only: ['stars', 'tags', 'abilities'] })
    },
    syncTagsToStar(starInput: StarMetaInput, tags: TagEditorTag[]) {
      router.put(`/star/sync-tags`, { ...starInput, tags } as any, { only: ['stars', 'tags', 'abilities', 'errors'] })
    },
    async fetchReadme(repo: GitHubRepoNode): Promise<string> {
      const userStore = useUserStore()

      const readme = await (
        await fetch(`https://api.github.com/repos/${repo.nameWithOwner}/readme`, {
          headers: {
            Accept: 'application/vnd.github.v3.html',
            Authorization: `bearer ${userStore.user?.access_token}`,
          },
        })
      ).text()

      return readme
    },
    async removeStar(id: string) {
      const userStore = useUserStore()
      const repo: Maybe<GitHubRepo> = this.starredRepos.find(repo => repo.node.id === id)

      await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `bearer ${userStore.user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: removeStarQuery(id),
        }),
      })

      if (repo) {
        const userStar: Maybe<UserStar> = this.userStars.find(star => star.repo_id === repo.node.databaseId)
        this.selectedRepos = this.selectedRepos.filter(selectedRepo => selectedRepo.id !== id)
        this.starredRepos.splice(this.starredRepos.indexOf(repo), 1)

        if (userStar) {
          router.delete(`/star/${userStar.id}`, { only: ['stars', 'tags', 'abilities'] })
        }
      }
    },
    backfillStarMetadata(starInput: (StarMetaInput & { starId: number })[]) {
      router.put(`/migrate`, { stars: starInput } as any, { only: ['stars', 'errors'] })
    },
    clearStarredRepos() {
      this.starredRepos = []
    },
    resetPageInfo() {
      this.pageInfo = {
        startCursor: null,
        endCursor: null,
        hasNextPage: true,
      }
    },
  },
})
