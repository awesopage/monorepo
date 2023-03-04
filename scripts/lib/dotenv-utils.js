import fs from 'node:fs'
import fsp from 'node:fs/promises'

const PLACEHOLDER_VALUE = '(define in .local files)'

export const readEnvFile = async (envPath, { ignoreComments = true } = {}) => {
  const allLines = fs.existsSync(envPath) ? (await fsp.readFile(envPath, 'utf-8')).split(/\r?\n/) : []

  const envLines = ignoreComments ? allLines.filter((line) => !line.trimStart().startsWith('#')) : allLines

  const placeholderKeys = allLines
    .filter((line) => isCommentLine(line) && line.includes(PLACEHOLDER_VALUE))
    .map((line) => {
      const startIndex = line.indexOf('#')
      const endIndex = line.indexOf('=')

      return line.substring(startIndex + 1, endIndex).trim()
    })

  return { envLines, placeholderKeys }
}

export const updateEnvFile = async (envPath, extraEnvs, placeholderKeys) => {
  const { envLines } = await readEnvFile(envPath, { ignoreComments: false })

  Object.keys(extraEnvs).forEach((key) => {
    setEnv(envLines, key, extraEnvs[key])
  })

  const usedPlaceholderKeys = placeholderKeys.filter((placeholderKey) => {
    const searchText = getSearchText(placeholderKey)

    return envLines.some((envLine) => !isCommentLine(envLine) && envLine.includes(searchText))
  })

  const unusedPlaceholderKeys = placeholderKeys.filter(
    (placeholderKey) => !usedPlaceholderKeys.includes(placeholderKey),
  )

  envLines.push(...unusedPlaceholderKeys.map((placeholderKey) => `# ${placeholderKey}=`))

  const outputLines = envLines.filter((envLine) => {
    if (isCommentLine(envLine)) {
      return usedPlaceholderKeys.every((placeholderKey) => !envLine.includes(getSearchText(placeholderKey)))
    }

    return true
  })

  await fsp.writeFile(envPath, outputLines.join('\n').replaceAll(PLACEHOLDER_VALUE, ''))
}

const setEnv = (envLines, key, value) => {
  const searchPrefix = getSearchText(key)
  const index = envLines.findIndex((envLine) => envLine.startsWith(searchPrefix))

  if (index === -1) {
    envLines.push(getKeyValueText(key, value))
  } else {
    envLines[index] = getKeyValueText(key, value)
  }
}

const isCommentLine = (line) => {
  return line.trimStart().startsWith('#')
}

const getSearchText = (key) => {
  return `${key}=`
}

const getKeyValueText = (key, value) => {
  return `${key}=${value}`
}
