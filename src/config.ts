import { PaperFormat } from 'puppeteer/lib/cjs/puppeteer/common/PDFOptions'

const toBoolean = (val: string | null) => {
  return val === 'true'
}
const toNumber = (val: string | null) => {
  if (val) {
    return Number(val)
  } else {
    return null
  }
}

/**
 * PDFOptions
 * @see
 */
export const PDF_OPTION_PRESET_FILE_PATH =
  process.env.HCPDF_PDF_OPTION_PRESET_FILE_PATH ?? './presets/default'
export const DEFAULT_PDF_OPTION_PRESET_NAME =
  process.env.HCPDF_DEFAULT_PDF_OPTION_PRESET_NAME ?? 'DEFAULT'

export const DEFAULT_PDF_OPTION_FORMAT = (process.env
  .HCPDF_DEFAULT_PDF_OPTION_FORMAT ?? 'a4') as PaperFormat

export const DEFAULT_PDF_OPTION_MARGIN =
  process.env.HCPDF_DEFAULT_PDF_OPTION_MARGIN ?? '10mm'

export const DEFAULT_PDF_OPTION_PRINT_BACKGROUND = toBoolean(
  process.env.HCPDF_DEFAULT_PDF_OPTION_PRINT_BACKGROUND ?? null
)
export const DEFAULT_PDF_OPTION_LANDSCAPE = toBoolean(
  process.env.HCPDF_DEFAULT_PDF_OPTION_LANDSCAPE ?? null
)
/**
 * Browser Page
 */
export const USER_AGENT = process.env.HCPDF_USER_AGENT ?? null
export const PAGES_NUM = Number(process.env.HCPDF_PAGES_NUM ?? '3')
export const PAGE_TIMEOUT_MILLISECONDS = Number(
  process.env.HCPDF_PAGE_TIMEOUT_MILLISECONDS ?? '30000'
)
// 'true' or otherwise
// @see https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-pageemulatemediatypetype
export const EMULATE_MEDIA_TYPE_SCREEN_ENABLED = toBoolean(
  process.env.HCPDF_EMULATE_MEDIA_TYPE_SCREEN_ENABLED ?? null
)
// use as Accept-Language Header https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Accept-Language
export const ACCEPT_LANGUAGE = process.env.HCPDF_ACCEPT_LANGUAGE ?? null

/**
 * Server
 * Fasitify Server options
 * https://github.com/fastify/fastify/blob/master/docs/Server.md
 */
export const SERVER_ADDRESS = process.env.HCPDF_SERVER_ADDRESS ?? '127.0.0.1'
export const SERVER_PORT = Number(process.env.HCPDF_SERVER_PORT ?? '8080')
// 10MiB
export const FASTIFY_BODY_LIMIT = Number(
  process.env.HCPDF_FASTIFY_BODY_LIMIT ?? '10485760'
)
// https://www.fastify.io/docs/latest/Logging/
export const FASTIFY_LOG_LEVEL = process.env.HCPDF_FASTIFY_LOG_LEVEL ?? 'info'
// if set use as key, else disabled
export const BEARER_AUTH_SECRET_KEY =
  process.env.HCPDF_BEARER_AUTH_SECRET_KEY ?? null

/**
 * Testing
 */
export const TEST_TARGET_URL =
  process.env.HCPDF_TEST_TARGET_URL ?? 'https://www.example.com'
export const TEST_POST_HTML =
  process.env.HCPDF_TEST_POST_HTML ??
  '<html><head><title>hc-pdf-sever</title></head> <body><p>this is <b>hc-pdf-server</b> test!</p></body></html>'

/**
 * Viewport
 * @see https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-pageviewport
 */
export const DEFAULT_VIEWPORT = {
  width: toNumber(process.env.HCPDF_VIEWPORT_WIDTH ?? '800'),
  height: toNumber(process.env.HCPDF_VIEWPORT_HEIGHT ?? '600'),
  deviceScaleFactor: toNumber(process.env.HCPDF_DEVICE_SCALE_FACTOR ?? null),
  isMobile: toBoolean(process.env.HCPDF_VIEWPORT_IS_MOBILE ?? null),
  isLandscape: toBoolean(process.env.HCPDF_VIEWPORT_HAS_TOUCH ?? null),
  hasTouch: toBoolean(process.env.HCPDF_VIEWPORT_IS_LANDSCAPE ?? null),
}
