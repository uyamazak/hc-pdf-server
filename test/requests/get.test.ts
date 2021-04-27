import { test } from 'tap'
import { InjectOptions } from 'light-my-request'
import { app } from '../../src/app'
import {
  TEST_TARGET_URL,
  DEFAULT_PRESET_PDF_OPTIONS_NAME,
} from '../../src/config'

interface Test {
  teardown(cb: unknown): unknown
}
async function build(t: Test) {
  const myApp = await app({ pagesNum: 2 })
  t.teardown(myApp.close.bind(myApp))
  return myApp
}

test('request test', async (t) => {
  t.test('/pdf_options response is match', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/pdf_options',
    } as InjectOptions)
    t.equal(res.payload, JSON.stringify(app.getPresetPDFOptions()))
    t.end()
  })

  t.test('GET / without url', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        pdf_option: DEFAULT_PRESET_PDF_OPTIONS_NAME,
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

  t.test('GET / with default preset name', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        pdf_option: DEFAULT_PRESET_PDF_OPTIONS_NAME,
        url: TEST_TARGET_URL,
      },
    } as InjectOptions)
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'application/pdf')
    t.end()
  })
})
