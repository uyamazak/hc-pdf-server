import * as puppeteer from 'puppeteer'
import { ChromeArgOptions, Page } from 'puppeteer'
const PAGES_NUM = 3
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
    pages.push(await browser.newPage())
  }
  return pages
}

export function* hcPageNumGenerator(): Generator<number> {
  let i = 0;
  while (true) {
    if (i >= PAGES_NUM) {
      i = 0
    } else {
      i++
    }
    yield i
  }
}
