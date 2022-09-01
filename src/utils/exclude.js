module.exports = function exclude(item, keys) {

  for (let key of keys) {
    delete item[key]
  }

  return item
}
