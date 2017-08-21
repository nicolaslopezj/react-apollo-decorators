import isPlainObject from 'lodash/isPlainObject'

export default function filterObject(obj, key) {
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue
    if (isPlainObject(obj[i])) {
      filterObject(obj[i], key)
    } else if (i === key) {
      delete obj[key]
    }
  }
  return obj
}
