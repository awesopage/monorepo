import { fileURLToPath } from 'node:url'

export const isMainModule = (metaUrl) => {
  // Based on https://exploringjs.com/nodejs-shell-scripting/ch_nodejs-path.html#detecting-if-module-is-main
  if (!metaUrl.startsWith('file:')) {
    return false
  }

  const modulePath = fileURLToPath(metaUrl)

  return process.argv[1] === modulePath
}

export const runScript = (script) => {
  script(process.argv.slice(2)).catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
