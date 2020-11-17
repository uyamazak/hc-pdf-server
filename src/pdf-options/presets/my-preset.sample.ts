/**
 * @see https://github.com/puppeteer/puppeteer/blob/v5.3.1/docs/api.md#pagepdfoptions
 */

import { PDFOptions } from 'puppeteer'

export const PDFOptionsPreset: { [key: string]: PDFOptions } = {
  MYA4: {
    format: 'A4',
  },
  /**
   * add your options
   */
}
