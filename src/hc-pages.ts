import * as puppeteer from 'puppeteer'
import { ChromeArgOptions, Page } from 'puppeteer'
import { PAGES_NUM, USER_AGENT, PAGE_TIMEOUT_MILLISECONDS } from './config'

const generateLaunchOptions = (): ChromeArgOptions => {
  return {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  }
}

export const getHcPages = async (): Promise<Page[]> => {
  const launchOptions = generateLaunchOptions()
  const browser = await puppeteer.launch(launchOptions)
  const pages = []
  for (let i = 0; i < PAGES_NUM; i++) {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(PAGE_TIMEOUT_MILLISECONDS)
    if (USER_AGENT) {
      await page.setUserAgent(USER_AGENT)
    }
    pages.push(page)
  }
  return pages
}

export function* hcPageNumGenerator(): Generator<number> {
  let i = 0;
  while (true) {
    if (i >= PAGES_NUM - 1) {
      i = 0
    } else {
      i++
    }
    yield i
  }
}
