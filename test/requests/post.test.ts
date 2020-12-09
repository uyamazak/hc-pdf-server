import { test } from 'tap'
import { InjectOptions } from 'light-my-request'
import { app } from '../../src/app'
import {
  TEST_POST_HTML,
  DEFAULT_PRESET_PDF_OPTIONS_NAME,
} from '../../src/config'

async function build(t) {
  const myApp = await app()
  t.tearDown(myApp.close.bind(myApp))
  t.tearDown(async () => await myApp.destoroyHcPages())
  return myApp
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

  t.test('POST / with default preset name', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'POST',
      url: '/',
      body: {
        pdf_option: DEFAULT_PRESET_PDF_OPTIONS_NAME,
        html: TEST_POST_HTML,
      },
    } as InjectOptions)
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'application/pdf')
    t.end()
  })
})
