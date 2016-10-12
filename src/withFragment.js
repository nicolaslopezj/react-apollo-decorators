import { createFragment } from 'apollo-client'
import _ from 'underscore'

export default function (doc, fragments) {
  return function (ComposedComponent) {
    const fragment = createFragment(doc, fragments)
    const name = doc.definitions[0].name.value
    ComposedComponent.fragmentName = name
    ComposedComponent.fragment = fragment
    return ComposedComponent
  }
}

export const getFragments = function (fragments) {
  if (!fragments) return
  const present = []
  return fragments.filter(fragment => {
    const name = fragment.name.value
    if (_.contains(present, name)) {
      return false
    }
    present.push(name)
    return true
  })
}
