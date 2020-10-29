import { launch, ChromeArgOptions, Page } from 'puppeteer'

interface HcPageConfig {
  PAGES_NUM: number
  USER_AGENT: string
  PAGE_TIMEOUT_MILLISECONDS: number
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
    for (let i = 0; i < this.config.PAGES_NUM; i++) {
      const page = await browser.newPage()
      page.setDefaultNavigationTimeout(this.config.PAGE_TIMEOUT_MILLISECONDS)
      if (this.config.USER_AGENT) {
        await page.setUserAgent(this.config.USER_AGENT)
      }
      pages.push(page)
      console.log(`page number ${i} is added`)
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
