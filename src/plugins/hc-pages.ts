import { FastifyInstance } from 'fastify'
import { launch, ChromeArgOptions, Page, Browser } from 'puppeteer'
import fp from 'fastify-plugin'
import { HcPageConfig } from '../types/hc-pages'
export class HCPages {
  private pages: Page[]
  private config: HcPageConfig
  private browser: Browser
  public pageNumGenerator: Generator<number>

  constructor(config: HcPageConfig) {
    this.config = config
    this.pageNumGenerator = this.hcPageNumGenerator()
  }

  async init(): Promise<void> {
    const launchOptions = this.generateLaunchOptions()
    this.browser = await launch(launchOptions)
    const browserVersion = await this.browser.version()
    console.log(`browser.verison is ${browserVersion}`)
    this.pages = await this.createPages()
  }

  async destoroy(): Promise<void> {
    await this.closePages()
    await this.closeBrowser()
  }

  getCurrentPage(): Page {
    const pageNo = this.pageNumGenerator.next().value
    return this.pages[pageNo]
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

  *hcPageNumGenerator(): Generator<number> {
    let pageNum = 0
    const max = this.config.pagesNum - 1
    while (true) {
      if (pageNum > max) {
        pageNum = 0
      }
      yield pageNum++
    }
  }
}

async function plugin(
  fastify: FastifyInstance,
  options: HcPageConfig,
  next: (err?: Error) => void
) {
  const hcPages = new HCPages(options)
  await hcPages.init()
  fastify.decorate('getHcPage', () => {
    const page = hcPages.getCurrentPage()
    return page
  })
  fastify.decorate('destoroyHcPages', async () => {
    await hcPages.destoroy()
  })
  next()
}

export const hcPagesPlugin = fp(plugin, {
  fastify: '^3.0.0',
  name: 'hc-pages-plugin',
})
