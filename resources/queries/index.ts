import { CursorDirection } from '@/types'

export const fetchStarsQuery = (cursorDirection: CursorDirection = CursorDirection.AFTER, perPage = 100): string => {
  const pageInfo =
    cursorDirection === CursorDirection.AFTER
      ? `endCursor
        hasNextPage`
      : `startCursor
        hasPreviousPage`

  return `query FetchStars($cursor: String) {
  viewer {
    starredRepositories(first: ${perPage}, orderBy: {field: STARRED_AT, direction: DESC}, ${cursorDirection}: $cursor) {
      totalCount
      edges {
        node {
          id
          nameWithOwner
          description
          url
          databaseId
          isArchived
          primaryLanguage {
            name
          }
          defaultBranchRef {
            name
          }
          stargazerCount
          forkCount
          pushedAt
        }
        cursor
      }
      pageInfo {
        ${pageInfo}
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
