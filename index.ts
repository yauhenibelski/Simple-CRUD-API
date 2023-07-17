import http from 'node:http'
import dotenv from 'dotenv'
import process from 'node:process'
import cluster, { Worker } from 'node:cluster'
import { cpus } from 'node:os'

import { handleRoute } from './routes'

dotenv.config()

export function createApp() {
  const server = http.createServer()
  server.on('request', handleRoute)
  return server
}

if (process.env.NODE_ENV === 'production') {
  const app = createApp()
  app.listen(Number(process.env.PORT))
}

if (process.env.NODE_ENV === 'multi') {
  const numCPUs = cpus().length

  if (cluster.isPrimary) {
    const pidToPort: { [id: number]: number } = {}
    let worker: Worker, port

    for (let i = 0; i < numCPUs; i++) {
      port = 4000 + i
      worker = cluster.fork({ port: port })

      if (worker.process.pid) {
        pidToPort[worker.process.pid] = port
      }
    }

    console.log(pidToPort)

    cluster.on('exit', function (worker) {
      console.log('worker ' + worker.process.pid + ' died')
    })
  } else {
    const app = createApp()
    app.listen(process.env.port)

    console.log(`Worker ${process.pid} started on port: ${process.env.port}`)
  }
}
