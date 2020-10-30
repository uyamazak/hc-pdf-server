import { launch, ChromeArgOptions, Page } from 'puppeteer'

interface HcPageConfig {
  PAGES_NUM: number
  USER_AGENT: string
  PAGE_TIMEOUT_MILLISECONDS: number
  EMULATE_MEDIA_TYPE_SCREEN: string
  ACCEPT_LANGUAGE: string
}
export class HCPages {
  private pages: Page[]
  private pageNumGenerator: Generator<number>
  private config: HcPageConfig

  constructor(config: HcPageConfig) {
    this.config = config
    this.pageNumGenerator = this.hcPageNumGenerator()
  }

  async init() {
    this.pages = await this.createHcPages()
  }

  getCurrentPage() {
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
    const launchOptions = this.generateLaunchOptions()
    const browser = await launch(launchOptions)
    const pages = []
    const {
      PAGE_TIMEOUT_MILLISECONDS,
      USER_AGENT,
      EMULATE_MEDIA_TYPE_SCREEN,
      ACCEPT_LANGUAGE
    } = this.config
    for (let i = 0; i < this.config.PAGES_NUM; i++) {
      const page = await browser.newPage()
      page.setDefaultNavigationTimeout(PAGE_TIMEOUT_MILLISECONDS)
      if (USER_AGENT) {
        console.log(`user agent set ${USER_AGENT}`)
        await page.setUserAgent(USER_AGENT)
      }
      if (EMULATE_MEDIA_TYPE_SCREEN === 'true') {
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
