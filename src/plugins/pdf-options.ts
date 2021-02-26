import { PDFOptions } from 'puppeteer'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import {
  PresetPDFOptions,
  PresetPDFOptionsLoaderConfig,
  PresetPDFOptionsModule,
} from '../types/pdf-options'

export class PresetPDFOptionsLoader {
  preset: PresetPDFOptions
  defaultPDFOptions = {} as PDFOptions
  filePath: string

  constructor(config: PresetPDFOptionsLoaderConfig) {
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
  options: PresetPDFOptionsLoaderConfig,
  next: (err?: Error) => void
) {
  const presetPDFOptionsLoader = new PresetPDFOptionsLoader(options)
  await presetPDFOptionsLoader.init()
  fastify.decorate('getPDFOptions', (name?: string) => {
    return presetPDFOptionsLoader.get(name)
  })
  fastify.decorate('getPresetPDFOptions', () => {
    return presetPDFOptionsLoader.preset
  })
  next()
}

export const hcPDFOptionsPlugin = fp(plugin, {
  fastify: '^3.0.0',
  name: 'hc-pdf-options-plugin',
})

declare module 'fastify' {
  interface FastifyInstance {
    getPDFOptions(name?: string): PDFOptions
    getPresetPDFOptions(): PresetPDFOptions
  }
}
