import { every, some, reject, get } from 'lodash'

const logicalTypeMap = {
  any: some,
  all: every,
  none: reject
}

const operators = {
  contains(source, substring) {
    return source
      .trim()
      .toLowerCase()
      .includes(substring.trim().toLowerCase())
  },
  notContains(source, substring) {
    return !operators.contains(source, substring)
  },
  is(source, target) {
    return source.trim().toLowerCase() === target.trim().toLowerCase()
  },
  isnt(source, target) {
    return source.trim().toLowerCase() !== target.trim().toLowerCase()
  },
  greaterThan(source, target) {
    return parseInt(source, 10) > parseInt(target, 10)
  },
  greaterThanOrEqualTo(source, target) {
    return parseInt(source, 10) >= parseInt(target, 10)
  },
  equals(source, target) {
    return parseInt(source, 10) === parseInt(target, 10)
  },
  lessThan(source, target) {
    return parseInt(source, 10) < parseInt(target, 10)
  },
  lessThanOrEqualTo(source, target) {
    return parseInt(source, 10) <= parseInt(target, 10)
  },
  hasAllTags(source, target) {
    return source.map(t => t.name).every(val => target.map(t => t.name).includes(val))
  },
  hasAnyTags(source, target) {
    return source.map(t => t.name).some(val => target.map(t => t.name).includes(val))
  },
  hasNoneTags(source, target) {
    return !source.map(t => t.name).some(val => target.map(t => t.name).includes(val))
  },
  hasAnyLanguage(source, target) {
    return target.map(l => l.name).includes(source)
  },
  hasNoneLanguage(source, target) {
    return !target.map(l => l.name).includes(source)
  },
  isState(target) {
    return target === true
  },
  isntState(target) {
    return target === false
  }
}

export default function(stars, predicate) {
  return stars.filter(star => {
    return predicate.groups.every(group => {
      return logicalTypeMap[group.logicalType](group.predicates, p => {
        if (get(star, p.selectedTarget)) {
          return operators[p.operator](get(star, p.selectedTarget), p.argument)
        } else if (p.selectedTarget === 'astralRepoState') {
          return operators[p.operator](get(star, p.argument.key))
        } else {
          return operators[p.operator]('', p.argument)
        }
      })
    })
  })
}
