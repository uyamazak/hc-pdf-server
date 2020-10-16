import fastify from 'fastify'
import { getHcPages, hcPageNumGenerator } from './hc-pages'
import { loadPDFOptionsPreset, getPDFOptionsFromPreset } from './pdf-options/'
import { DEFAULT_PDF_OPTION_PRESET_NAME } from './config'


interface getQuerystring {
  url: string
  pdfoption?: string
}
const getQueryStringJsonSchema = {
  url: { type: 'string' },
  pdfoption: { type: ['null', 'string'] }
}

const schema = {
  querystring: getQueryStringJsonSchema,
}


export const app = async () => {
  const hcPages = await getHcPages()
  const pageNumGen = hcPageNumGenerator()
  const pdfOptionsPreset = await loadPDFOptionsPreset()
  const server = fastify({
    logger: {
      level: 'debug',
    } })

  server.get<{
    Querystring: getQuerystring
  }>('/', { schema },  async (request, reply) => {
    const pageNo = pageNumGen.next().value
    console.log(pageNo)
    const page = hcPages[pageNo]
    const url = request.query.url
    if (!url) {
      reply.code(400).send({error: 'url is required'})
      return
    }
    try {
      await page.goto(
        url,
        {
          timeout: 30000,
          waitUntil: ['load', 'domcontentloaded']
        }
      )
    } catch(error) {
      reply.code(500).send({ error, url })
      return
    }
    const pdfOptionsQuery = request.query.pdfoption ?? DEFAULT_PDF_OPTION_PRESET_NAME
    const pdfOptions = getPDFOptionsFromPreset(pdfOptionsPreset, pdfOptionsQuery)
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
  })

  server.get('/pdfoptions', async (request, reply) => {
    reply.send(pdfOptionsPreset)
  })

  server.post('/', async (request, reply) => {
    const pageNo = pageNumGen.next().value
    const page = hcPages[pageNo]
    return 'pong\n'
  })
  return server
}

