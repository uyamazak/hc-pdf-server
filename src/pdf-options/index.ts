import { PDFOptions } from 'puppeteer'

interface PDFOptionPreset {
  [key: string]: PDFOptions
}

interface PDFOptionsPresetModule {
  PDFOptionsPreset: PDFOptionPreset
}
interface PDFOptionsPresetConfig {
  filePath: string
}
export class PDFOptionsPreset {
  preset: PDFOptionPreset
  defaultPDFOptions = {} as PDFOptions
  filePath: string

  constructor(config: PDFOptionsPresetConfig) {
    if (!config.filePath) {
      throw new Error('filePath is empty')
    }
    this.filePath = config.filePath
  }

  async init(): Promise<void> {
    this.preset = await this.loadPDFOptionsPreset()
  }

  async loadPDFOptionsPreset(): Promise<PDFOptionPreset> {
    const preset = (await import(this.filePath)) as PDFOptionsPresetModule
    return preset.PDFOptionsPreset
  }

  get(name?: string): PDFOptions {
    if (!name) {
      return this.defaultPDFOptions
    }
    if (!(name in this.preset)) {
      console.error('PDFOptions not found name:', name)
      return this.defaultPDFOptions
    }
    return this.preset[name]
  }
}
