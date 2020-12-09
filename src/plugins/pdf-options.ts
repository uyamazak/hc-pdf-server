import { PDFOptions } from 'puppeteer'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import {
  PresetPDFOptions,
  PresetPDFOptionsConfig,
  PresetPDFOptionsModule,
} from '../types/pdf-options'

export class PresetPDFOptionsLoader {
  preset: PresetPDFOptions
  defaultPDFOptions = {} as PDFOptions
  filePath: string

  constructor(config: PresetPDFOptionsConfig) {
    if (!config.filePath) {
      throw new Error('filePath is empty')
    }
    this.filePath = config.filePath
  }

  async init(): Promise<void> {
    this.preset = await this.loadPDFOptionsPreset()
  }

  async loadPDFOptionsPreset(): Promise<PresetPDFOptions> {
    const preset = (await import(this.filePath)) as PresetPDFOptionsModule
    return preset.PresetPDFOptions
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

async function plugin(
  fastify: FastifyInstance,
  options: PresetPDFOptionsConfig,
  next: (err?: Error) => void
) {
  const pdfOptionsPreset = new PresetPDFOptionsLoader(options)
  await pdfOptionsPreset.init()
  fastify.decorate('getPDFOptions', (name?: string) => {
    return pdfOptionsPreset.get(name)
  })
  fastify.decorate('getPDFOptionsPreset', () => {
    return pdfOptionsPreset.preset
  })
  next()
}

export const hcPDFOptionsPlugin = fp(plugin, {
  fastify: '^3.0.0',
  name: 'hc-pdf-options-plugin',
})
