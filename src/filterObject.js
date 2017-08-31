import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'

export default function filterObject(obj, key) {
  console.log('filtering object', obj, key)
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue
    if (isPlainObject(obj[i]) || isArray(obj[i])) {
      filterObject(obj[i], key)
    } else if (i === key) {
      delete obj[key]
    }
  }
  return obj
}
