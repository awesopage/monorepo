const { parserPlugins } = require('@istanbuljs/schema').defaults.nyc

module.exports = {
  parserPlugins: [...parserPlugins, 'typescript', 'jsx'],
  cache: false,
  all: true,
  include: ['packages/pkg-*/src/**'],
  exclude: ['packages/pkg-app-shared/**'],
  'temp-dir': './output/test/coverage/tmp',
  'report-dir': './output/test/coverage/report',
  reporter: ['text-summary', 'html', 'lcov'],
}
