import { FastifyInstance } from 'fastify'
import { launch, ChromeArgOptions, Page, Browser } from 'puppeteer'
import fp from 'fastify-plugin'
import { HcPageConfig } from '../types/hc-pages'
export class HCPages {
  private pages: Page[]
  private readyPages: Page[]
  private currentPromises: Promise<unknown>[]
  private config: HcPageConfig
  private browser: Browser

  constructor(config: HcPageConfig) {
    this.config = config
    this.currentPromises = []
  }

  async init(): Promise<void> {
    const launchOptions = this.generateLaunchOptions()
    this.browser = await launch(launchOptions)
    const browserVersion = await this.browser.version()
    console.log(`browser.verison is ${browserVersion}`)
    this.pages = await this.createPages()
    this.readyPages = [...this.pages]
  }

  async destroy(): Promise<void> {
    await this.closePages()
    await this.closeBrowser()
  }

  private async runCallback(
    page: Page,
    callback: (page: Page) => Buffer
  ): Promise<Buffer> {
    const result = await callback(page)
    this.readyPages.push(page)
    return result
  }

  async runOnPage(callback: (page: Page) => Buffer): Promise<Buffer> {
    let page = this.readyPages.pop()
    while (!page) {
      await Promise.race(this.currentPromises)
      page = this.readyPages.pop()
    }

    const promise = this.runCallback(page, callback)
    this.currentPromises.push(promise)
    const result = await promise
    this.currentPromises.splice(this.currentPromises.indexOf(promise), 1)

    return result
  }

  private generateLaunchOptions(): ChromeArgOptions {
    return {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    }
  }

  async createPages(): Promise<Page[]> {
    const pages = []
    for (let i = 0; i < this.config.pagesNum; i++) {
      const page = await this.browser.newPage()
      await this.applyPageConfigs(page)
      console.log(`page number ${i} is created`)
      pages.push(page)
    }
    return pages
  }

  async applyPageConfigs(page: Page): Promise<void> {
    const {
      pageTimeoutMilliseconds,
      userAgent,
      emulateMediaTypeScreenEnabled,
      acceptLanguage,
      viewport,
    } = this.config
    page.setDefaultNavigationTimeout(pageTimeoutMilliseconds)
    if (viewport) {
      await page.setViewport(viewport)
    }
    console.log(`viewport set ${JSON.stringify(page.viewport())}`)
    if (userAgent) {
      console.log(`user agent set ${userAgent}`)
      await page.setUserAgent(userAgent)
    }
    if (emulateMediaTypeScreenEnabled) {
      console.log('emulateMediaType screen')
      await page.emulateMediaType('screen')
    }
    if (acceptLanguage) {
      console.log(`Accept-Language set: ${acceptLanguage}`)
      await page.setExtraHTTPHeaders({
        'Accept-Language': acceptLanguage,
      })
    }
  }

  async closePages(): Promise<void> {
    for (let i = 0; i < this.config.pagesNum; i++) {
      await this.pages[i].close()
      console.log(`page number ${i} is closed`)
    }
  }

  async closeBrowser(): Promise<void> {
    await this.browser.close()
    console.log('browser is closed')
  }
}

async function plugin(
  fastify: FastifyInstance,
  options: HcPageConfig,
  next: (err?: Error) => void
) {
  const hcPages = new HCPages(options)
  await hcPages.init()
  fastify.decorate('runOnPage', async (callback) => {
    return await hcPages.runOnPage(callback)
  })
  fastify.decorate('destroyHcPages', async () => {
    await hcPages.destroy()
  })
  next()
}

export const hcPagesPlugin = fp(plugin, {
  fastify: '^3.0.0',
  name: 'hc-pages-plugin',
})
