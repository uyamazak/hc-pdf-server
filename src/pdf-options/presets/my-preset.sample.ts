/**
 * @see https://github.com/puppeteer/puppeteer/blob/v5.3.1/docs/api.md#pagepdfoptions
 */

import { PDFOptions } from 'puppeteer'

export const PresetPDFOptions: { [key: string]: PDFOptions } = {
  MYA4: {
    format: 'a4',
  },
  /**
   * add your options
   */
}
