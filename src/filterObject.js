export default function filterObject (obj, key) {
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue
    if (typeof obj[i] === 'object') {
      filterObject(obj[i], key)
    } else if (i === key) {
      delete obj[key]
    }
  }
  return obj
}
