export const fetchStarsQuery = (perPage = 100): string => {
  return `query FetchStars($cursor: String, $direction: OrderDirection!) {
  viewer {
    starredRepositories(first: ${perPage}, orderBy: {field: STARRED_AT, direction: $direction}, after: $cursor) {
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
