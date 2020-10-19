import fastify from 'fastify'
import formBody from 'fastify-formbody'
import { getHcPages, hcPageNumGenerator } from './hc-pages'
import { loadPDFOptionsPreset, getPDFOptionsFromPreset } from './pdf-options/'
import { DEFAULT_PDF_OPTION_PRESET_NAME } from './config'


interface getQuerystring {
  url: string
  pdfoption?: string
}

interface postQuerystring {
  html: string
  pdfoption?: string
}

const getSchema = {
  querystring: {
    url: { type: 'string' },
    pdfoption: { type: ['null', 'string'] }
  }
}

const postSchema = {
  querystring: {
    html: { type: 'string' },
    pdfoption: { type: ['null', 'string'] }
  }
}

const getPDFHttpHeader = (buffer: Buffer) => {
  return {
    'Content-Type': 'application/pdf',
    'Content-Length': buffer.length,
    // prevent cache
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': 0,
  }
}

export const app = async () => {
  const hcPages = await getHcPages()
  const pageNumGen = hcPageNumGenerator()
  const pdfOptionsPreset = await loadPDFOptionsPreset()
  const server = fastify({
    logger: {
      level: 'debug',
    }
  })
  server.register(formBody)

  const getCurrentPage = () => {
    const pageNo = pageNumGen.next().value
    return hcPages[pageNo]
  }

  server.get<{
    Querystring: getQuerystring
  }>('/', { schema: getSchema },  async (request, reply) => {
    const url = request.query.url
    if (!url) {
      reply.code(400).send({error: 'url is required'})
      return
    }
    const page = getCurrentPage()
    try {
      await page.goto(url)
    } catch(error) {
      reply.code(500).send({ error, url })
      return
    }
    const pdfOptionsQuery = request.query.pdfoption ?? DEFAULT_PDF_OPTION_PRESET_NAME
    const pdfOptions = getPDFOptionsFromPreset(pdfOptionsPreset, pdfOptionsQuery)
    const buffer = await page.pdf(pdfOptions)
    reply.headers(getPDFHttpHeader(buffer))
    reply.send(buffer)
  })

  server.post<{
    Querystring: postQuerystring
  }>('/', { schema: postSchema }, async (request, reply) => {
    const body = request.body
    const html = body['html'] ?? ''
    console.log(html)
    if (!html) {
      reply.code(400).send({ error: 'html is required' })
      return
    }
    const page = getCurrentPage()
    await page.setContent(html)
    const pdfOptionsQuery = request.query.pdfoption ?? DEFAULT_PDF_OPTION_PRESET_NAME
    const pdfOptions = getPDFOptionsFromPreset(pdfOptionsPreset, pdfOptionsQuery)
    const buffer = await page.pdf(pdfOptions)
    reply.headers(getPDFHttpHeader(buffer))
    reply.send(buffer)
  })

  server.get('/pdfoptions', async (request, reply) => {
    reply.send(pdfOptionsPreset)
  })

  return server
}

