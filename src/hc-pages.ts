import { launch, ChromeArgOptions, Page } from 'puppeteer'
import { PAGES_NUM, USER_AGENT, PAGE_TIMEOUT_MILLISECONDS } from './config'

const generateLaunchOptions = (): ChromeArgOptions => {
  return {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ]
  }
}

export const getHcPages = async (): Promise<Page[]> => {
  const launchOptions = generateLaunchOptions()
  const browser = await launch(launchOptions)
  const pages = []
  for (let i = 0; i < PAGES_NUM; i++) {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(PAGE_TIMEOUT_MILLISECONDS)
    if (USER_AGENT) {
      await page.setUserAgent(USER_AGENT)
    }
    pages.push(page)
    console.log(`page number ${i} is added`)
  }
  return pages
}

export function* hcPageNumGenerator(): Generator<number> {
  let i = 0;
  const max = PAGES_NUM - 1
  while (true) {
    if (i >= max) {
      i = 0
    } else {
      i++
    }
    yield i
  }
}
