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
  private preset: PDFOptionPreset
  defaultPDFOptions = {} as PDFOptions
  filePath: string

  constructor(config: PDFOptionsPresetConfig) {
    this.filePath = config.filePath
  }

  async init(){
    this.preset = await this.loadPDFOptionsPreset()
  }

  async loadPDFOptionsPreset(): Promise<PDFOptionPreset> {
    const preset = await import(this.filePath ) as PDFOptionsPresetModule
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
