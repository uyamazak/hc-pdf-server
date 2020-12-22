import { PDFOptions } from 'puppeteer'

export interface PresetPDFOptions {
  [key: string]: PDFOptions
}
export interface PresetPDFOptionsModule {
  PresetPDFOptions: PresetPDFOptions
}
interface PresetPDFOptionsLoaderConfig {
  filePath: string
}

declare module 'fastify' {
  interface FastifyInstance {
    getPDFOptions(name?: string): PDFOptions
    getPresetPDFOptions(): PresetPDFOptions
  }
}
