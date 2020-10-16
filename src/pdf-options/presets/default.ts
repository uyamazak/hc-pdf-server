import { PDFOptions } from 'puppeteer'
export interface PDFMargin {
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
}

const defaultMargin: PDFMargin = {
  top: '10mm',
  bottom: '10mm',
  left: '10mm',
  right: '10mm',
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
  'A4Landscape': {
    format: 'A4',
    landscape: true,
    margin: defaultMargin,
  },
  'A3Landscape': {
    format: 'A3',
    landscape: true,
    margin: defaultMargin,
  }
}
