import { PDFOptions } from 'puppeteer'
const presetsFilePath = process.env.MY_PDF_OPTION_PRESETS_FILE_PATH ?? './default-presets'

interface PDFOptionPresets {
  [key: string]: PDFOptions
}

interface PDFOptionsPresetModule {
  PDFOptionsPresets: PDFOptionPresets
}

export const loadPDFOptionsPresets = async (): Promise<PDFOptionPresets> => {
  const presets = await import(presetsFilePath) as PDFOptionsPresetModule
  return presets.PDFOptionsPresets
}

export const getPDFOptionsFromPresets = (presets: PDFOptionPresets, name?: string): PDFOptions => {
  if (!name) {
    return {}
  }
  const option = presets[name] ?? {}
  return option
}
