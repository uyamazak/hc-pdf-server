import { Viewport } from 'puppeteer'

export interface getQuerystring {
  url: string
  pdf_option?: string
}

export interface postBody {
  html: string
  pdf_option?: string
}

export interface AppConfig {
  presetPdfOptionsFilePath: string
  defaultPresetPdfOptionsName: string
  bearerAuthSecretKey: string
  pagesNum: number
  userAgent: string
  pageTimeoutMilliseconds: number
  emulateMediaTypeScreenEnabled: boolean
  acceptLanguage: string
  fastifyLogLevel: string
  fastifyBodyLimit: number
  viewport: Viewport
}
