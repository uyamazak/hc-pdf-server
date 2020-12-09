import { Viewport } from 'puppeteer'

interface getQuerystring {
  url: string
  pdf_option?: string
}

interface postBody {
  html: string
  pdf_option?: string
}

interface AppConfig {
  defaultPdfOptionPresetName: string
  bearerAuthSecretKey: string
  pagesNum: number
  userAgent: string
  pageTimeoutMilliseconds: number
  pdfOptionPresetFilePath: string
  emulateMediaTypeScreenEnabled: boolean
  acceptLanguage: string
  fastifyLogLevel: string
  fastifyBodyLimit: number
  viewport: Viewport
}
