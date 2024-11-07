export default function excludeFrom(item: any, keys: string[]) {
  for (const key of keys) {
    delete item[key]
  }

  return item
}
