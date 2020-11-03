import fastify from 'fastify'
import formBody from 'fastify-formbody'
import { hcPages } from './plugins/hc-pages'
import bearerAuthPlugin from 'fastify-bearer-auth'
import { PDFOptionsPreset } from './pdf-options/'
import {
  DEFAULT_PDF_OPTION_PRESET_NAME,
  BEARER_AUTH_SECRET_KEY,
  PAGES_NUM,
  USER_AGENT,
  PAGE_TIMEOUT_MILLISECONDS,
  PDF_OPTION_PRESET_FILE_PATH,
  EMULATE_MEDIA_TYPE_SCREEN_ENABLED,
  ACCEPT_LANGUAGE
} from './config'
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
  const pdfOptionsPreset = new PDFOptionsPreset({ filePath: PDF_OPTION_PRESET_FILE_PATH })
  await pdfOptionsPreset.init()

  const server = fastify({
    logger: {
      level: 'debug',
    }
  })
  server.register(formBody)
  server.register(hcPages, {
    PAGES_NUM,
    USER_AGENT,
    PAGE_TIMEOUT_MILLISECONDS,
    EMULATE_MEDIA_TYPE_SCREEN_ENABLED,
    ACCEPT_LANGUAGE,
  })

  if (BEARER_AUTH_SECRET_KEY) {
    const keys = new Set([BEARER_AUTH_SECRET_KEY])
    server.register(bearerAuthPlugin, { keys })
  }

  server.get<{
    Querystring: getQuerystring
  }>('/', { schema: getSchema },  async (request, reply) => {
    const url = request.query.url
    if (!url) {
      reply.code(400).send({error: 'url is required'})
      return
    }
    const page = server.getHcPage()
    try {
      await page.goto(url)
    } catch(error) {
      reply.code(500).send({ error, url })
      return
    }
    const pdfOptionsQuery = request.query.pdfoption ?? DEFAULT_PDF_OPTION_PRESET_NAME
    const pdfOptions = pdfOptionsPreset.get(pdfOptionsQuery)
    const buffer = await page.pdf(pdfOptions)
    reply.headers(getPDFHttpHeader(buffer))
    reply.send(buffer)
  })

  server.post<{
    Querystring: postQuerystring
  }>('/', { schema: postSchema }, async (request, reply) => {
    const body = request.body ?? null
    if (!body) {
      reply.code(400).send({ error: 'request body is empty' })
      return
    }
    const html = body['html'] ?? ''
    if (!html) {
      reply.code(400).send({ error: 'html is required' })
      return
    }
    const pdfOptionsQuery = body['pdfoption'] ?? DEFAULT_PDF_OPTION_PRESET_NAME
    const page = server.getHcPage()
    await page.setContent(html, {waitUntil: ['domcontentloaded',]})
    const pdfOptions = pdfOptionsPreset.get(pdfOptionsQuery)
    const buffer = await page.pdf(pdfOptions)
    reply.headers(getPDFHttpHeader(buffer))
    reply.send(buffer)
  })

  server.get('/pdfoptions', async (_, reply) => {
    reply.send(pdfOptionsPreset.preset)
  })

  return server
}

