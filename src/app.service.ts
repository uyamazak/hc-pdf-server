import { Injectable } from '@nestjs/common';
import { hcPages } from './hc-pages'


@Injectable()
export class AppService {
  async get(url: string): Promise<Buffer> {
    const pages = await hcPages(1)
    const page = pages[0]
    await page.goto(
      url,
      {
        timeout: 30000,
        waitUntil: ['load', 'domcontentloaded']
      }
    )
    return await page.pdf()
  }
}
