import { every, some, reject } from 'lodash'

const logicalTypeMap = {
  any: some,
  all: every,
  none: reject
}

const operators = {
  contains(source, substring) {
    return ~source.toLowerCase().indexOf(substring.toLowerCase())
  },
  is(source, target) {
    return source.toLowerCase() === target.toLowerCase()
  },
  isnt(source, target) {
    return source.toLowerCase() !== target.toLowerCase()
  }
}

export default function(stars, predicate) {
  return stars.filter(star => {
    return predicate.groups.every(group => {
      return logicalTypeMap[group.logicalType](group.predicates, p => {
        if (star.node[p.selectedTarget]) {
          return operators[p.operator](star.node[p.selectedTarget], p.argument)
        } else {
          return false
        }
      })
    })
  })
}
