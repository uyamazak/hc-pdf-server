import { Page, Viewport } from 'puppeteer'

interface HcPageConfig {
  pagesNum: number
  userAgent: string
  pageTimeoutMilliseconds: number
  emulateMediaTypeScreenEnabled: boolean
  acceptLanguage: string
  viewport?: Viewport
}

declare module 'fastify' {
  interface FastifyInstance {
    getHcPage(): Page
    destoroyHcPages(): Promise<void>
  }
}
