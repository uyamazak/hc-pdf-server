/**
 * @see https://github.com/puppeteer/puppeteer/blob/v5.3.1/docs/api.md#pagepdfoptions
 */

import { PDFOptions } from 'puppeteer'
import { DEFAULT_PDF_OPTION_MARGIN } from '../../config'
export interface PDFMargin {
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
}

const defaultMargin: PDFMargin = {
  top: DEFAULT_PDF_OPTION_MARGIN,
  bottom: DEFAULT_PDF_OPTION_MARGIN,
  left: DEFAULT_PDF_OPTION_MARGIN,
  right: DEFAULT_PDF_OPTION_MARGIN,
}

export const PDFOptionsPreset: {[key:string]: PDFOptions} = {
  'A4': {
    format: 'A4',
    margin: defaultMargin,
  },
  'A3': {
    format: 'A3',
    margin: defaultMargin,
  },
  'A4L': {
    format: 'A4',
    landscape: true,
    margin: defaultMargin,
  },
  'A3L': {
    format: 'A3',
    landscape: true,
    margin: defaultMargin,
  }
}
