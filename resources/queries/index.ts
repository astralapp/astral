import { FetchDirection } from '@/scripts/types'

export const fetchStarsQuery = (
  cursor: Nullable<string> = null,
  direction: FetchDirection = FetchDirection.DESC,
  perPage = 100
): string => {
  const cursorFilter = cursor ? `after:"${cursor}"` : 'after:null'

  return `{
  viewer {
    starredRepositories(first: ${perPage}, orderBy: {field: STARRED_AT, direction: ${direction}}, ${cursorFilter}) {
      totalCount
      edges {
        node {
          id
          nameWithOwner
          description
          url
          databaseId
          isArchived
          defaultBranchRef {
            name
          }
          primaryLanguage {
            name
          }
          stargazers {
            totalCount
          }
          forkCount
          pushedAt
          releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
            edges {
              node {
                tagName
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
    }
  }
}`
}

export const removeStarQuery = (id: string): string => `mutation RemoveStar {
  removeStar(input:{starrableId: "${id}"}) {
    starrable {
      id
    }
  }
}`
