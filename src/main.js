import { App } from './app/App.js'

const app = await App.create({
  argv: process.argv.slice(2),
  cwd: process.cwd()
})

await app.run()
