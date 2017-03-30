import { intersection } from 'lodash'

export default function (value, query) {
  //  If there's no query return all items
  if (query.query.replace(/\s/g, '') === '') {
    return value
  }

  //  Begin the filter process
  return value.filter((repo) => {
    const searchText = `${repo.full_name} ${repo.hasOwnProperty('description') ? repo.description : ''} ${repo.notes}`.toLowerCase()
    if (query.tags.length) {
      // Intersect repo tags with query tags to ensure repo contains all tags in query
      const tagNames = repo.tags.map(tag => tag.name.toLowerCase())
      const hasTags = intersection(query.tags, tagNames).length === query.tags.length
      const hasStrings = ~searchText.indexOf(query.strings.join(' ').toLowerCase())
      return hasTags && hasStrings
    } else {
      //  Just search the repo text and/or description
      return ~searchText.indexOf(query.strings.join(' ').toLowerCase())
    }
  })
}
