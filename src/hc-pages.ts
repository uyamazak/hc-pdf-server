import * as puppeteer from 'puppeteer'
import { ChromeArgOptions, Page } from 'puppeteer'

const generateLaunchOptions = (): ChromeArgOptions => {
  return {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  }
}

export const hcPages = async (pagesNum: number): Promise<Page[]> => {
  if (!pagesNum) {
    pagesNum = 1
  }
  console.log(puppeteer)
  const launchOptions = generateLaunchOptions()
  const browser = await puppeteer.launch(launchOptions)
  const pages = []
  for (let i = 0; i < pagesNum; i++) {
    pages.push(await browser.newPage())
  }
  return pages
}
