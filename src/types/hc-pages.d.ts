import { Viewport, Page } from 'puppeteer'

interface HcPageConfig {
  pagesNum: number
  userAgent: string
  pageTimeoutMilliseconds: number
  emulateMediaTypeScreenEnabled: boolean
  acceptLanguage: string
  viewport?: Viewport
}

type RunOnPageCallback<T = Buffer> = (page: Page) => Promise<T>
declare module 'fastify' {
  interface FastifyInstance {
    runOnPage<T>(callback: RunOnPageCallback<T>): Promise<T>
    destroyHcPages(): Promise<void>
  }
}
