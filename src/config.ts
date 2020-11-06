/**
 * PDFOptions
 */
export const PDF_OPTION_PRESET_FILE_PATH =
  process.env.HCPDF_PDF_OPTION_PRESET_FILE_PATH ?? './presets/default'
export const DEFAULT_PDF_OPTION_PRESET_NAME =
  process.env.HCPDF_DEFAULT_PDF_OPTION_PRESET_NAME ?? 'A4'
export const DEFAULT_PDF_OPTION_MARGIN =
  process.env.HCPDF_DEFAULT_PDF_OPTION_MARGIN ?? '10mm'

/**
 * Browser Page
 */
export const USER_AGENT = process.env.HCPDF_USER_AGENT ?? ''
export const PAGES_NUM = Number(process.env.HCPDF_PAGES_NUM ?? '3')
export const PAGE_TIMEOUT_MILLISECONDS = Number(
  process.env.HCPDF_PAGE_TIMEOUT_MILLISECONDS ?? '30000'
)
// 'true' or otherwise
export const EMULATE_MEDIA_TYPE_SCREEN_ENABLED =
  process.env.HCPDF_EMULATE_MEDIA_TYPE_SCREEN_ENABLED ?? ''
export const ACCEPT_LANGUAGE = process.env.HCPDF_ACCEPT_LANGUAGE ?? ''

/**
 * Server
 */
export const SERVER_ADDRESS = process.env.HCPDF_SERVER_ADDRESS ?? '127.0.0.1'
export const SERVER_PORT = Number(process.env.HCPDF_SERVER_PORT ?? '8080')
// if set use as key, else disabled
export const BEARER_AUTH_SECRET_KEY =
  process.env.HCPDF_BEARER_AUTH_SECRET_KEY ?? ''

/**
 * Testing
 */
export const TEST_TARGET_URL =
  process.env.HCPDF_TEST_TARGET_URL ?? 'https://www.google.com'
export const TEST_POST_HTML =
  process.env.HCPDF_TEST_POST_HTML ??
  '<html><head><title>hc-pdf-sever</title></head> <body><p>this is <b>hc-pdf-server</b> test!</p></body></html>'
