import { test, InjectOptions } from 'tap'
import { app } from '../../src/app'
import { PDFOptionsPreset } from '../../src/pdf-options'
import { PDF_OPTION_PRESET_FILE_PATH, TEST_TARGET_URL } from '../../src/config'

async function build(t) {
  const myApp = await app()
  t.tearDown(myApp.close.bind(myApp))
  t.tearDown(async () => await myApp.destoroyHcPages())
  return myApp
}

async function getFirstPresetName() {
  const pdfOptionsPreset = new PDFOptionsPreset({
    filePath: PDF_OPTION_PRESET_FILE_PATH,
  })
  await pdfOptionsPreset.init()
  return Object.keys(pdfOptionsPreset.preset)[0]
}

test('request test', async (t) => {
  t.test('/pdf_options response is match', async (t) => {
    const app = await build(t)
    const pdfOptionsPreset = new PDFOptionsPreset({
      filePath: PDF_OPTION_PRESET_FILE_PATH,
    })
    await pdfOptionsPreset.init()
    const preset = pdfOptionsPreset.preset
    const res = await app.inject({
      method: 'GET',
      url: '/pdf_options',
    } as InjectOptions)
    t.equal(res.payload, JSON.stringify(preset))
    t.end()
  })

  t.test('GET / without url', async (t) => {
    const app = await build(t)
    const pdfOptionName = await getFirstPresetName()
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        pdf_option: pdfOptionName,
        url: '',
      },
    } as InjectOptions)
    t.equal(res.statusCode, 400)
    t.end()
  })

  t.test('GET / without preset name', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        url: TEST_TARGET_URL,
      },
    } as InjectOptions)
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'application/pdf')
    t.end()
  })

  t.test('GET / with first preset name', async (t) => {
    const app = await build(t)
    const pdfOptionName = await getFirstPresetName()
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        pdf_option: pdfOptionName,
        url: TEST_TARGET_URL,
      },
    } as InjectOptions)
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'application/pdf')
    t.end()
  })
})
