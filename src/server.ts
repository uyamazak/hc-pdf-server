import { app } from './app'
import { PORT, ADDRESS } from './config'

(async () => {
  const server = await app()
  server.listen(PORT, ADDRESS, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
})()
