'use strict'

const webpack = require('webpack')
const Listr = require('listr')
const chalk = require('chalk')
const del = require('del')
const Multispinner = require('Multispinner')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '

if (process.env.BUILD_TARGET === 'clean') clean()
else build()

function clean() {
  del.sync(['dist/*', 'build/pack/*', '!dist/icons', '!dist/icons/icon.*', '!dist/script'])
  console.log(`\n${doneLog}\n`)
  process.exit()
}

async function build() {
  del.sync(['dist/electron/*', '!.gitkeep'])

  const tasks2 = ['main', 'renderer']
  const m = new Multispinner(tasks2, {
    preText: 'building',
    postText: 'process',
  })

  let results = ''

  const tasks = new Listr(
    [
      {
        title: 'building master process',
        task: async () => {
          await pack(mainConfig)
            .then((result) => {
              results += result + '\n\n'
            })
            .catch((err) => {
              console.log(`\n  ${errorLog}failed to build main process`)
              console.error(`\n${err}\n`)
            })
        },
      },
      {
        title: 'building renderer process',
        task: async () => {
          await pack(rendererConfig)
            .then((result) => {
              results += result + '\n\n'
            })
            .catch((err) => {
              console.log(`\n  ${errorLog}failed to build renderer process`)
              console.error(`\n${err}\n`)
            })
        },
      },
    ],
    { concurrent: 2 },
  )

  await tasks
    .run()
    .then(() => {
      process.stdout.write('\x1B[2J\x1B[0f')
      console.log(`\n\n${results}`)
      console.log(`${okayLog}take it away ${chalk.yellow('`electron-builder`')}\n`)
      process.exit()
    })
    .catch((err) => {
      process.exit(1)
    })
}

function pack(config) {
  return new Promise((resolve, reject) => {
    config.mode = 'production'
    webpack(config, (err, stats) => {
      if (err) reject(err.stack || err)
      else if (stats.hasErrors()) {
        let err = ''

        stats
          .toString({
            chunks: false,
            colors: true,
          })
          .split(/\r?\n/)
          .forEach((line) => {
            err += `    ${line}\n`
          })

        reject(err)
      } else {
        resolve(
          stats.toString({
            chunks: false,
            colors: true,
          }),
        )
      }
    })
  })
}
