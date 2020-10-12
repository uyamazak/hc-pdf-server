import fastify from 'fastify'
import { getHcPages, hcPageNumGenerator } from './hc-pages'


export const app = async () => {
  const hcPages = await getHcPages()
  const pageNumGen = hcPageNumGenerator()
  const server = fastify({
    logger: {
      level: 'debug',
    } })

  server.get('/', async (request, reply) => {
    const pageNo = pageNumGen.next().value
    const page = hcPages[pageNo]
    await page.goto(
      'https://www.google.com',
      {
        timeout: 30000,
        waitUntil: ['load', 'domcontentloaded']
      }
    )
    const buffer = await page.pdf()
    reply.headers({
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=1234.pdf',
      'Content-Length': buffer.length,
      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': 0,
    })
    reply.send(buffer)
    return
  })

  server.post('/', async (request, reply) => {
    const pageNo = pageNumGen.next().value
    const page = hcPages[pageNo]
    return 'pong\n'
  })
  return server
}

