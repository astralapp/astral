export const removeStarQuery = (id: string): string => `mutation RemoveStar {
  removeStar(input:{starrableId: "${id}"}) {
    starrable {
      id
    }
  }
}`
