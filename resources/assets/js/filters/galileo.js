import Vue from "vue"
import { intersection } from "lodash"

Vue.filter("galileo", function (value) {
  const query = this.searchQuery
  //  If there's no query return all items
  if (query.query.replace(/\s/g, "") === "") {
    return value
  }

  //  Begin the filter process
  return value.filter((repo) => {
    const searchText = `${repo.full_name} ${repo.hasOwnProperty("description") ? repo.description : ""}`.toLowerCase()
    //  If theres tags in the search query we have to bind the star to the repo
    if (query.tags.length) {
      const matchedStar = this.stars.filter((star) => {
        return star.repo_id === repo.id
      })[0]
      //  If star matched and it has tags
      if (matchedStar && matchedStar.tags.length) {
        //  Map the tags to return an array of tag names
        const matchedTags = matchedStar.tags.map((tag) => {
          return tag.name.toLowerCase()
        })
        //  Intersect the matched tags with the query's tags to check that they match
        const hasTags = intersection(query.tags, matchedTags).length === query.tags.length
        //  Match the strings as well
        const hasStrings = ~searchText.indexOf(query.strings.join(" ").toLowerCase())
        return hasTags && hasStrings
      }
    } else {
      //  Just search the repo text and/or description
      return ~searchText.indexOf(query.strings.join(" ").toLowerCase())
    }
  })
})
