export default function stringifyAttributes(attributes: Record<string, any>) {
  const keys = Object.keys(attributes)
  const content = keys.map((k, i) => `${k}:"${attributes[k]}"` + (i == keys.length - 1 ? '' : ','))
  return `{${content.reduce((curr, prev) => curr + prev, '')}}`
}
