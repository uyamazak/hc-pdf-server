import { PDFOptions } from 'puppeteer'

export const PDFOptionsPreset: {[key:string]: PDFOptions} = {
  'A4': {
    format: 'A4',
  },
  'A3': {
    format: 'A3',
  }
}
