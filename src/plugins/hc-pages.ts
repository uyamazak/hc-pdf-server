import { launch, ChromeArgOptions, Page, Browser } from 'puppeteer'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    getHcPage(): Page
    closeHcPages(): Promise<void>
    closeBrowser(): Promise<void>
  }
}

interface HcPageConfig {
  PAGES_NUM: number
  USER_AGENT: string
  PAGE_TIMEOUT_MILLISECONDS: number
  EMULATE_MEDIA_TYPE_SCREEN_ENABLED: string
  ACCEPT_LANGUAGE: string
}

export class HCPages {
  private pages: Page[]
  private pageNumGenerator: Generator<number>
  private config: HcPageConfig
  private browser: Browser

  constructor(config: HcPageConfig) {
    this.config = config
    this.pageNumGenerator = this.hcPageNumGenerator()
  }

  async init() {
    const launchOptions = this.generateLaunchOptions()
    this.browser = await launch(launchOptions)
    this.pages = await this.createHcPages()
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
      ]
    }
  }

  async createHcPages(): Promise<Page[]> {
    const pages = []
    const {
      PAGE_TIMEOUT_MILLISECONDS,
      USER_AGENT,
      EMULATE_MEDIA_TYPE_SCREEN_ENABLED,
      ACCEPT_LANGUAGE
    } = this.config
    for (let i = 0; i < this.config.PAGES_NUM; i++) {
      const page = await this.browser.newPage()
      page.setDefaultNavigationTimeout(PAGE_TIMEOUT_MILLISECONDS)
      if (USER_AGENT) {
        console.log(`user agent set ${USER_AGENT}`)
        await page.setUserAgent(USER_AGENT)
      }
      if (EMULATE_MEDIA_TYPE_SCREEN_ENABLED === 'true') {
        console.log(`emulateMediaType screen`)
        await page.emulateMediaType('screen')
      }
      if (ACCEPT_LANGUAGE) {
        console.log(`Accept-Language set: ${ACCEPT_LANGUAGE}`)
        await page.setExtraHTTPHeaders({'Accept-Language': ACCEPT_LANGUAGE})
      }
      console.log(`page number ${i} is created`)
      pages.push(page)
    }
    return pages
  }

  async closeHcPages (): Promise<void> {
    for (let i = 0; i < this.config.PAGES_NUM; i++) {
      await this.pages[i].close()
      console.log(`page number ${i} is closed`)
    }
  }
  async closeBrowser(): Promise<void> {
    await this.browser.close()
    console.log(`browser is closed`)
  }

  * hcPageNumGenerator(): Generator<number> {
    let i = 0;
    const max = this.config.PAGES_NUM - 1
    while (true) {
      if (i >= max) {
        i = 0
      } else {
        i++
      }
      yield i
    }
  }
}

export async function plugin(fastify, options: HcPageConfig, next) {
  const hcPages = new HCPages(options)
  await hcPages.init()
  fastify.decorate('getHcPage', () => {
    const page = hcPages.getCurrentPage()
    return page
  })
  fastify.decorate('closeHcPages', async () => {
    await hcPages.closeHcPages()
  })
  fastify.decorate('closeBrowser', async () => {
    await hcPages.closeBrowser()
  })
  next()
}

export const hcPages = fp(plugin, {
  fastify: '^3.0.0',
  name: 'hc-pdf-pages-plugin'
})


