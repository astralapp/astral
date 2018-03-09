import { intersection } from 'lodash'

export default function(stars, query) {
  //  If there's no query return all items
  if (query.query.replace(/\s/g, '') === '') {
    return stars
  }

  //  Begin the filter process
  return stars.filter(({ value }) => {
    const searchText = `${value.node.nameWithOwner} ${
      value.node.hasOwnProperty('description') ? value.node.description : ''
    } ${value.notes}`.toLowerCase()
    if (query.tags.length) {
      // Intersect value tags with query tags to ensure value contains all tags in query
      const tagNames = value.tags.map(tag => tag.name.toLowerCase())
      const hasTags =
        intersection(query.tags, tagNames).length === query.tags.length
      const hasStrings = ~searchText.indexOf(
        query.strings.join(' ').toLowerCase()
      )
      return hasTags && hasStrings
    } else {
      //  Just search the value text and/or description
      return ~searchText.indexOf(query.strings.join(' ').toLowerCase())
    }
  })
}
