import { test } from 'tap'
import { InjectOptions } from 'light-my-request'
import { app } from '../../src/app'
import pdf from 'pdf-parse'

interface Test {
  tearDown(cb: unknown): unknown
}
async function build(t: Test) {
  const myApp = await app()
  t.tearDown(myApp.close.bind(myApp))
  return myApp
}

test('PDF content test', async (t) => {
  t.test('POST / pdf content is match in concurrency requests', async (t) => {
    const app = await build(t)
    const testNumbers = Array(30).keys()
    const requests = Array.from(testNumbers).map((n: number) => {
      return app.inject({
        method: 'POST',
        url: `/?n=${n}`,
        body: {
          html: `<html><body>test-${n}</body></html>`,
        },
      } as InjectOptions)
    })
    const responses = await Promise.all(requests)
    for (const n of testNumbers) {
      const pdfResult = await pdf(responses[n].rawPayload)
      // remove line breaks
      const pdfText = pdfResult.text.trim()
      t.equal(pdfText, `test-${n}`)
    }
    t.end()
  })
})
