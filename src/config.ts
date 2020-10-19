export const PDF_OPTION_PRESET_FILE_PATH = process.env.HCPDF_PDF_OPTION_PRESET_FILE_PATH ?? './presets/default'
export const DEFAULT_PDF_OPTION_PRESET_NAME = process.env.HCPDF_DEFAULT_PDF_OPTION_PRESET_NAME ?? 'A4'
export const USER_AGENT = process.env.HCPDF_USER_AGENT ?? ''
export const PAGES_NUM = Number(process.env.PAGES_NUM ?? '3')
export const PAGE_TIMEOUT_MILLISECONDS = Number(process.env.PAGE_TIMEOUT_MILLISECONDS ?? '30000')
