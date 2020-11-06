import { app } from './app'
import { SERVER_PORT, SERVER_ADDRESS } from './config'
;(async () => {
  const server = await app()
  server.listen(SERVER_PORT, SERVER_ADDRESS, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
})()
