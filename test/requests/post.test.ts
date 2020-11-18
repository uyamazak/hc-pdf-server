import { test, InjectOptions } from 'tap'
import { app } from '../../src/app'
import { PDFOptionsPreset } from '../../src/pdf-options'
import { PDF_OPTION_PRESET_FILE_PATH, TEST_POST_HTML } from '../../src/config'

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

test('POST request test', async (t) => {
  t.test('POST / without body', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'POST',
      url: '/',
    } as InjectOptions)
    t.equal(res.statusCode, 400)
    t.end()
  })

  t.test('POST / with empty html', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'POST',
      url: '/',
      body: {
        html: '',
      },
    } as InjectOptions)
    t.equal(res.statusCode, 400)
    t.end()
  })

  t.test('POST / with first preset name', async (t) => {
    const app = await build(t)
    const pdfOptionName = await getFirstPresetName()
    const res = await app.inject({
      method: 'POST',
      url: '/',
      body: {
        pdfoption: pdfOptionName,
        html: TEST_POST_HTML,
      },
    } as InjectOptions)
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'application/pdf')
    t.end()
  })
})
