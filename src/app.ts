import fastify, { FastifyInstance } from 'fastify'
import formBody from 'fastify-formbody'
import bearerAuthPlugin from 'fastify-bearer-auth'
import { hcPagesPlugin } from './plugins/hc-pages'
import { PDFOptionsPreset } from './pdf-options'
import {
  DEFAULT_PDF_OPTION_PRESET_NAME,
  BEARER_AUTH_SECRET_KEY,
  PAGES_NUM,
  USER_AGENT,
  PAGE_TIMEOUT_MILLISECONDS,
  PDF_OPTION_PRESET_FILE_PATH,
  EMULATE_MEDIA_TYPE_SCREEN_ENABLED,
  ACCEPT_LANGUAGE,
} from './config'

interface getQuerystring {
  url: string
  pdfoption?: string
}

interface postBody {
  html: string
  pdfoption?: string
}

const getSchema = {
  querystring: {
    url: { type: 'string' },
    pdfoption: { type: ['null', 'string'] },
  },
}

const postSchema = {
  querystring: {
    html: { type: 'string' },
    pdfoption: { type: ['null', 'string'] },
  },
}

const createPDFHttpHeader = (buffer: Buffer) => ({
  'Content-Type': 'application/pdf',
  'Content-Length': buffer.length,
  // prevent cache
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: 0,
})
interface AppConfig {
  defaultPdfOptionPresetName: string
  bearerAuthSecretKey: string
  pagesNum: number
  userAgent: string
  pageTimeoutMilliseconds: number
  pdfOptionPresetFilePath: string
  emulateMediaTypeScreenEnabled: string
  acceptLanguage: string
}

const defaultAppConfig: AppConfig = {
  defaultPdfOptionPresetName: DEFAULT_PDF_OPTION_PRESET_NAME,
  bearerAuthSecretKey: BEARER_AUTH_SECRET_KEY,
  pagesNum: PAGES_NUM,
  userAgent: USER_AGENT,
  pageTimeoutMilliseconds: PAGE_TIMEOUT_MILLISECONDS,
  pdfOptionPresetFilePath: PDF_OPTION_PRESET_FILE_PATH,
  emulateMediaTypeScreenEnabled: EMULATE_MEDIA_TYPE_SCREEN_ENABLED,
  acceptLanguage: ACCEPT_LANGUAGE,
}

export const app = async (
  appConfig = {} as Partial<AppConfig>
): Promise<FastifyInstance> => {
  const {
    defaultPdfOptionPresetName,
    bearerAuthSecretKey,
    pagesNum,
    userAgent,
    pageTimeoutMilliseconds,
    pdfOptionPresetFilePath,
    emulateMediaTypeScreenEnabled,
    acceptLanguage,
  } = { ...defaultAppConfig, ...appConfig }

  const pdfOptionsPreset = new PDFOptionsPreset({
    filePath: pdfOptionPresetFilePath,
  })
  await pdfOptionsPreset.init()

  const server = fastify({
    logger: {
      level: 'debug',
    },
  })
  server.register(formBody)
  server.register(hcPagesPlugin, {
    pagesNum,
    userAgent,
    pageTimeoutMilliseconds,
    emulateMediaTypeScreenEnabled,
    acceptLanguage,
  })

  if (bearerAuthSecretKey) {
    const keys = new Set([bearerAuthSecretKey])
    server.register(bearerAuthPlugin, { keys })
  }

  server.get<{
    Querystring: getQuerystring
  }>('/', { schema: getSchema }, async (request, reply) => {
    const { url } = request.query
    if (!url) {
      reply.code(400).send({ error: 'url is required' })
      return
    }
    const page = server.getHcPage()
    try {
      await page.goto(url)
    } catch (error) {
      reply.code(500).send({ error, url })
      return
    }
    const pdfOptionsQuery =
      request.query.pdfoption ?? defaultPdfOptionPresetName
    const pdfOptions = pdfOptionsPreset.get(pdfOptionsQuery)
    const buffer = await page.pdf(pdfOptions)
    reply.headers(createPDFHttpHeader(buffer))
    reply.send(buffer)
  })

  server.post('/', { schema: postSchema }, async (request, reply) => {
    const body = (request.body as postBody) ?? null
    if (!body) {
      reply.code(400).send({ error: 'request body is empty' })
      return
    }
    const html = body.html ?? ''
    if (!html) {
      reply.code(400).send({ error: 'html is required' })
      return
    }
    const pdfOptionsQuery = body.pdfoption ?? defaultPdfOptionPresetName
    const page = server.getHcPage()
    await page.setContent(html, { waitUntil: ['domcontentloaded'] })
    const pdfOptions = pdfOptionsPreset.get(pdfOptionsQuery)
    const buffer = await page.pdf(pdfOptions)
    reply.headers(createPDFHttpHeader(buffer))
    reply.send(buffer)
  })

  server.get('/pdfoptions', (_, reply) => {
    reply.send(pdfOptionsPreset.preset)
  })

  return server
}
