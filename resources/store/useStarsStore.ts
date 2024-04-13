import { fetchStarsQuery, removeStarQuery } from '@/queries'
import { useStarsFilterStore } from '@/store/useStarsFilterStore'
import { useUserStore } from '@/store/useUserStore'
import {
  FetchDirection,
  GitHubRepo,
  GitHubRepoNode,
  PaginationResponse,
  RepoLanguage,
  StarMetaInput,
  TagEditorTag,
} from '@/types'
import {
  Predicate,
  PredicateGroup,
  PredicateOperator,
  PredicateOperatorCheck,
  PredicateTarget,
  dateOperators,
  languageOperators,
  numberOperators,
  stateOperators,
  stringOperators,
  tagOperators,
} from '@/utils/predicates'
import { router } from 'hybridly'
import { Dictionary, every, get, reject, some } from 'lodash'
import keyBy from 'lodash/keyBy'
import { defineStore } from 'pinia'

type LogicalOperatorFunction = (predicates: Predicate[], predicateCheck: (predicate: Predicate) => boolean) => boolean

export const useStarsStore = defineStore({
  actions: {
    addTagToStars(tagId: number, repos: StarMetaInput[]) {
      router.post(route('star.tags.store'), {
        data: {
          repos,
          tagId,
        },
        only: ['stars', 'tags'],
      })
    },
    backfillStarMetadata(starInput: (StarMetaInput & { starId: number })[]) {
      router.put(route('migrate.update'), {
        data: {
          stars: starInput,
        },
        only: ['stars'],
      })
    },
    clearStarredRepos() {
      this.starredRepos = []
    },
    async fetchReadme(repoName?: string) {
      if (!repoName) {
        return Promise.resolve('')
      }

      const userStore = useUserStore()

      const response = await fetch(`https://api.github.com/repos/${repoName}/readme`, {
        headers: {
          Accept: 'application/vnd.github.v3.html',
          Authorization: `bearer ${userStore.user?.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Unable to fetch readme for ${repoName}`)
      }

      const readme = await response.text()

      return readme
    },
    async fetchStars(cursor: Nullable<string> = null, direction: FetchDirection = FetchDirection.DESC) {
      this.isFetchingStars = true

      const userStore = useUserStore()
      const result = await (
        await fetch('https://api.github.com/graphql', {
          body: JSON.stringify({
            query: fetchStarsQuery(cursor, direction),
          }),
          headers: {
            Authorization: `bearer ${userStore.user?.accessToken}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })
      ).json()

      return result.data
    },
    async removeStar(id: string) {
      const userStore = useUserStore()
      const repo: Maybe<GitHubRepo> = this.starredRepos.find(repo => repo.node.id === id)

      await fetch('https://api.github.com/graphql', {
        body: JSON.stringify({
          query: removeStarQuery(id),
        }),
        headers: {
          Authorization: `bearer ${userStore.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (repo) {
        const userStar: Maybe<App.Data.StarData> = this.userStars.find(star => star.repo_id === repo.node.databaseId)
        this.selectedRepos = this.selectedRepos.filter(selectedRepo => selectedRepo.id !== id)
        this.starredRepos.splice(this.starredRepos.indexOf(repo), 1)

        if (userStar) {
          router.delete(`/star/${userStar.id}`, { only: ['stars', 'tags'] })
        }
      }
    },
    resetPageInfo() {
      this.pageInfo = {
        endCursor: null,
        hasNextPage: true,
        startCursor: null,
      }
    },
    syncTagsToStar(starInput: StarMetaInput, tags: TagEditorTag[]) {
      router.put(route('star.tags.update'), {
        data: {
          ...starInput,
          tags,
        },
        only: ['stars', 'tags'],
      })
    },
  },
  getters: {
    allStars(): GitHubRepo[] {
      return this.starredRepos
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
          all: every,
          any: some,
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

                    return (operator.check as (source: App.Data.TagData[], target: App.Data.TagData[]) => boolean)(
                      tags,
                      p.argument as App.Data.TagData[]
                    )
                  } else {
                    const repoKeyValue = get(repo, p.selectedTarget)
                    if (repoKeyValue) {
                      // @ts-expect-error its complicated
                      return operator.check(repoKeyValue, p.argument)
                    } else {
                      // @ts-expect-error its complicated
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
    isAnyRepoSelected(): boolean {
      return !!Object.keys(this.selectedRepo).length
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
            count,
            name,
          }
        })
        .sort((a, b) => b.count - a.count)
    },
    selectedRepo(): GitHubRepoNode {
      return this.selectedRepos[0] || {}
    },
    untaggedStars(): GitHubRepo[] {
      return this.allStars.filter(repo => {
        const userStar: App.Data.StarData = this.userStarsByRepoId[repo.node.databaseId]

        return !userStar || !userStar.tags?.length
      })
    },
    userStarsByRepoId(): Dictionary<App.Data.StarData> {
      return keyBy(this.userStars, (star: App.Data.StarData) => `${star.repo_id}`)
    },
  },
  id: 'stars',
  state() {
    return {
      draggingRepos: [] as GitHubRepoNode[],
      hasFetchedFromStorage: false,
      isDraggingRepo: false,
      isFetchingStars: false,
      pageInfo: {
        endCursor: null,
        hasNextPage: true,
        startCursor: null,
      } as PaginationResponse,
      selectedRepos: [] as GitHubRepoNode[],
      starredRepos: [] as GitHubRepo[],
      totalRepos: 0,
      userStars: [] as App.Data.StarData[],
    }
  },
})
