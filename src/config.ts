import { PaperFormat } from 'puppeteer'

const toBoolean = (val: string | undefined) => {
  return val === 'true'
}
const toNumber = (val: string | undefined) => {
  if (val) {
    return Number(val)
  } else {
    return undefined
  }
}

/**
 * PDFOptions
 * @see https://pptr.dev/#?product=Puppeteer&version=v8.0.0&show=api-pagepdfoptions
 */
export const PRESET_PDF_OPTIONS_FILE_PATH =
  process.env.HCPDF_PRESET_PDF_OPTIONS_FILE_PATH ??
  '../pdf-options/presets/default'
export const DEFAULT_PRESET_PDF_OPTIONS_NAME =
  process.env.HCPDF_DEFAULT_PRESET_PDF_OPTIONS_NAME ?? 'DEFAULT'

export const DEFAULT_PDF_OPTION_FORMAT = (process.env
  .HCPDF_DEFAULT_PDF_OPTION_FORMAT ?? 'a4') as PaperFormat

export const DEFAULT_PDF_OPTION_MARGIN =
  process.env.HCPDF_DEFAULT_PDF_OPTION_MARGIN ?? '10mm'

export const DEFAULT_PDF_OPTION_PRINT_BACKGROUND = toBoolean(
  process.env.HCPDF_DEFAULT_PDF_OPTION_PRINT_BACKGROUND
)
export const DEFAULT_PDF_OPTION_LANDSCAPE = toBoolean(
  process.env.HCPDF_DEFAULT_PDF_OPTION_LANDSCAPE
)
/**
 * Browser Page
 */
export const USER_AGENT = process.env.HCPDF_USER_AGENT ?? undefined
export const PAGES_NUM = toNumber(process.env.HCPDF_PAGES_NUM) ?? 3
export const PAGE_TIMEOUT_MILLISECONDS = toNumber(
  process.env.HCPDF_PAGE_TIMEOUT_MILLISECONDS ?? '30000'
)
// 'true' or otherwise
// @see https://pptr.dev/#?product=Puppeteer&version=v8.0.0&show=api-pageemulatemediatypetype
export const EMULATE_MEDIA_TYPE_SCREEN_ENABLED = toBoolean(
  process.env.HCPDF_EMULATE_MEDIA_TYPE_SCREEN_ENABLED
)
// use as Accept-Language Header https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Accept-Language
export const ACCEPT_LANGUAGE = process.env.HCPDF_ACCEPT_LANGUAGE ?? undefined

/**
 * Server
 * Fasitify Server options
 * https://github.com/fastify/fastify/blob/master/docs/Server.md
 */
export const SERVER_ADDRESS = process.env.HCPDF_SERVER_ADDRESS ?? '127.0.0.1'
export const SERVER_PORT = toNumber(process.env.HCPDF_SERVER_PORT) ?? 8080
// 10MiB
export const FASTIFY_BODY_LIMIT = toNumber(
  process.env.HCPDF_FASTIFY_BODY_LIMIT ?? '10485760'
)
// https://www.fastify.io/docs/latest/Logging/
export const FASTIFY_LOG_LEVEL = process.env.HCPDF_FASTIFY_LOG_LEVEL ?? 'info'
// if set use as key, else disabled
export const BEARER_AUTH_SECRET_KEY =
  process.env.HCPDF_BEARER_AUTH_SECRET_KEY ?? undefined

/**
 * Testing
 */
export const TEST_TARGET_URL =
  process.env.HCPDF_TEST_TARGET_URL ?? 'https://www.example.com'
export const TEST_POST_HTML =
  process.env.HCPDF_TEST_POST_HTML ??
  '<html><head><title>hc-pdf-sever</title></head><body><p>this is <b>hc-pdf-server</b> test!</p></body></html>'

/**
 * Viewport
 * @see https://pptr.dev/#?product=Puppeteer&show=api-pageviewport
 */
export const DEFAULT_VIEWPORT = {
  width: toNumber(process.env.HCPDF_VIEWPORT_WIDTH) ?? 800,
  height: toNumber(process.env.HCPDF_VIEWPORT_HEIGHT) ?? 600,
  deviceScaleFactor: toNumber(process.env.HCPDF_DEVICE_SCALE_FACTOR) ?? 1,
  isMobile: toBoolean(process.env.HCPDF_VIEWPORT_IS_MOBILE),
  isLandscape: toBoolean(process.env.HCPDF_VIEWPORT_HAS_TOUCH),
  hasTouch: toBoolean(process.env.HCPDF_VIEWPORT_IS_LANDSCAPE),
}

const DEFAULT_BROWSER_LAUNCH_ARGS =
  '--no-sandbox,--disable-setuid-sandbox,--disable-gpu,--disable-dev-shm-usage'
export const BROWSER_LAUNCH_ARGS =
  process.env.HCEP_DEFAULT_BROWSER_LAUNCH_ARGS ?? DEFAULT_BROWSER_LAUNCH_ARGS
