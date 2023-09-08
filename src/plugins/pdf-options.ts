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

  constructor(preset: PresetPDFOptions) {
    this.preset = preset
  }

  static async init(
    config: PresetPDFOptionsLoaderConfig
  ): Promise<PresetPDFOptionsLoader> {
    const preset = await this.loadPDFOptionsPreset(config.filePath)
    if (!config.filePath) {
      throw new Error('filePath is required')
    }
    return new PresetPDFOptionsLoader(preset)
  }

  static async loadPDFOptionsPreset(
    filePath: string
  ): Promise<PresetPDFOptions> {
    const preset = (await import(filePath)) as PresetPDFOptionsModule
    return preset.PresetPDFOptions
  }

  get(name?: string): PDFOptions {
    if (!name) {
      return this.defaultPDFOptions
    }
    if (!(name in this.preset)) {
      console.error(`PDFOptions not found ${name}, use default.`)
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
  const presetPDFOptionsLoader = await PresetPDFOptionsLoader.init(options)
  fastify.decorate('getPDFOptions', (name?: string) => {
    return presetPDFOptionsLoader.get(name)
  })
  fastify.decorate('getPresetPDFOptions', () => {
    return presetPDFOptionsLoader.preset
  })
  next()
}

export const hcPDFOptionsPlugin = fp(plugin, {
  fastify: '^4.0.0',
  name: 'hc-pdf-options-plugin',
})

declare module 'fastify' {
  interface FastifyInstance {
    getPDFOptions(name?: string): PDFOptions
    getPresetPDFOptions(): PresetPDFOptions
  }
}
