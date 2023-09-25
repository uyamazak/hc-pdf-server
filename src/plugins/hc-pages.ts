import puppeteer from 'puppeteer'
import { BrowserLaunchArgumentOptions, Page, Browser, Viewport } from 'puppeteer'
import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    runOnPage<T>(callback: RunOnPageCallback<T>): Promise<T>
    destroyPages(): Promise<void>
  }
}

export const plugin = async (
  fastify: FastifyInstance,
  options: HcPagesOptions,
): Promise<void> => {
  const { pagesNum, pageOptions, launchOptions } = options
  const hcPages = await HCPages.init(pagesNum, pageOptions, launchOptions)
  console.log('hcPages', hcPages)
  fastify.decorate(
    'runOnPage',
    async (callback: RunOnPageCallback<unknown>) => {
      return await hcPages.runOnPage(callback)
    }
  )
  fastify.decorate('destroyPages', async () => {
    await hcPages.destroy()
  })
  fastify.addHook('onClose', async (instance, done) => {
    await instance.destroyPages()
    done()
  })
}

export const hcPages = fp(plugin, {
  fastify: '^4.0.0',
  name: 'hc-pages-plugin',
})

export default hcPages

export interface HcPagesOptions {
  pagesNum?: number
  pageOptions?: Partial<PageOptions>
  launchOptions?: BrowserLaunchArgumentOptions
}

export interface PageOptions {
  userAgent: string
  pageTimeoutMilliseconds: number
  emulateMediaTypeScreenEnabled: boolean
  acceptLanguage: string
  viewport?: Viewport
}

export type RunOnPageCallback<T> = (page: Page) => Promise<T>

const defaultPagesNum = 3

const defaultPageOptions: PageOptions = {
  userAgent: '',
  pageTimeoutMilliseconds: 10000,
  emulateMediaTypeScreenEnabled: false,
  acceptLanguage: '',
}

const defaultLaunchOptions: BrowserLaunchArgumentOptions = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
  ],
  headless: true
}

export class HCPages {
  private pagesNum: number
  private pages: Page[]
  private readyPages: Page[]
  private currentPromises: Promise<unknown>[]
  private pageOptions: PageOptions
  private browser: Browser

  constructor(
    browser: Browser,
    pagesNum: number,
    pageOptions = {} as Partial<PageOptions> | undefined
  ) {
    this.pagesNum = pagesNum
    this.pageOptions = { ...defaultPageOptions, ...pageOptions }
    this.browser = browser
    this.pages = []
    this.readyPages = []
    this.currentPromises = []
  }

  public static init = async (
    pagesNum = defaultPagesNum,
    pageOptions: Partial<PageOptions> | undefined = undefined,
    launchOptions?: BrowserLaunchArgumentOptions
  ): Promise<HCPages> => {
    const mergedLaunchOptions = { ...defaultLaunchOptions, ...launchOptions }
    console.debug('launchOptions', mergedLaunchOptions)
    const browser = await puppeteer.launch(mergedLaunchOptions)
    console.debug(`browser.verison is ${await browser.version()}`)
    const hcPages = new HCPages(browser, pagesNum, pageOptions)
    hcPages.pages = await hcPages.createPages()
    hcPages.readyPages = hcPages.pages
    return hcPages
  }

  public async destroy(): Promise<void> {
    await this.closePages()
    await this.closeBrowser()
  }

  private async runCallback<T>(
    page: Page,
    callback: RunOnPageCallback<T>
  ): Promise<T> {
    try {
      const result = await callback(page)
      return result
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      this.readyPages.push(page)
    }
  }

  public async runOnPage<T>(callback: RunOnPageCallback<T>): Promise<T> {
    let page = this.readyPages.pop()
    while (!page) {
      await Promise.race(this.currentPromises)
      page = this.readyPages.pop()
    }

    const promise = this.runCallback(page, callback)
    this.currentPromises.push(promise)
    try {
      return await promise
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      this.currentPromises.splice(this.currentPromises.indexOf(promise), 1)
    }
  }

  private async createPage(): Promise<Page> {
    const page = await this.browser.newPage()
    await this.applyPageConfigs(page)
    return page
  }

  private async createPages(): Promise<Page[]> {
    const pages = []
    for (let i = 0; i < this.pagesNum; i++) {
      const page = await this.createPage()
      console.log(`page number ${i} is created`)
      pages.push(page)
    }
    return pages
  }

  private async applyPageConfigs(page: Page): Promise<void> {
    const {
      pageTimeoutMilliseconds,
      userAgent,
      emulateMediaTypeScreenEnabled,
      acceptLanguage,
      viewport,
    } = this.pageOptions
    if (pageTimeoutMilliseconds) {
      page.setDefaultTimeout(pageTimeoutMilliseconds)
      console.log(`defaultTimeout set ${pageTimeoutMilliseconds}`)
    }
    if (viewport) {
      await page.setViewport(viewport)
      console.log(`viewport set ${JSON.stringify(page.viewport())}`)
    }
    if (userAgent) {
      await page.setUserAgent(userAgent)
      console.log(`user agent set ${userAgent}`)
    }
    if (emulateMediaTypeScreenEnabled) {
      await page.emulateMediaType('screen')
      console.log('emulateMediaType screen')
    }
    if (acceptLanguage) {
      await page.setExtraHTTPHeaders({
        'Accept-Language': acceptLanguage,
      })
      console.log(`Accept-Language set: ${acceptLanguage}`)
    }
  }

  private async closePages(): Promise<void> {
    for (let i = 0; i < this.pagesNum; i++) {
      await this.pages[i].close()
      console.log(`page number ${i} is closed`)
    }
  }

  private async closeBrowser(): Promise<void> {
    await this.browser.close()
    console.log('browser is closed')
  }
}
