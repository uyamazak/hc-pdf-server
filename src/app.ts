import fastify from 'fastify'
import { getHcPages, hcPageNumGenerator } from './hc-pages'
import { loadPDFOptionsPresets, getPDFOptionsFromPresets } from './pdf-options/'

interface getQuerystring {
  url: string
  pdfoption?: string
}

export const app = async () => {
  const hcPages = await getHcPages()
  const pageNumGen = hcPageNumGenerator()
  const pdfOptionPresets = await loadPDFOptionsPresets()
  const server = fastify({
    logger: {
      level: 'debug',
    } })

  server.get<{
    Querystring: getQuerystring;
  }>('/', async (request, reply) => {
    const pageNo = pageNumGen.next().value
    const page = hcPages[pageNo]
    const url = request.query.url
    await page.goto(
      url,
      {
        timeout: 30000,
        waitUntil: ['load', 'domcontentloaded']
      }
    )
    const pdfOptionsQuery = request.query.pdfoption ?? 'A3'
    const pdfOptions = getPDFOptionsFromPresets(pdfOptionPresets, pdfOptionsQuery)
    const buffer = await page.pdf(pdfOptions)
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

