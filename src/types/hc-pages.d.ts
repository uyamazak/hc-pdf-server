import { Viewport } from 'puppeteer'

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
    runOnPage(callback: unknown): Buffer
    destroyHcPages(): Promise<void>
  }
}
