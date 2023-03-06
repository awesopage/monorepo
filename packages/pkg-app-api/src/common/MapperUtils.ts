export const mapTimestampToString = (timestamp: Date): string => {
  return timestamp.toISOString()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapValueToString = (value: any): string => {
  return `${value}`
}

export const mapValueToNumber = (value: bigint): number => {
  return Number(value)
}
