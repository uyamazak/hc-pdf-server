import { PDFOptions } from 'puppeteer'
import { PDF_OPTION_PRESET_FILE_PATH } from '../config'

const defaultPDFOptions = {} as PDFOptions

interface PDFOptionPreset {
  [key: string]: PDFOptions
}

interface PDFOptionsPresetModule {
  PDFOptionsPreset: PDFOptionPreset
}

export const loadPDFOptionsPreset = async (): Promise<PDFOptionPreset> => {
  const Preset = await import(PDF_OPTION_PRESET_FILE_PATH) as PDFOptionsPresetModule
  return Preset.PDFOptionsPreset
}

export const getPDFOptionsFromPreset = (Preset: PDFOptionPreset, name?: string): PDFOptions => {
  if (!name) {
    return defaultPDFOptions
  }
  return Preset[name] ?? defaultPDFOptions
}
