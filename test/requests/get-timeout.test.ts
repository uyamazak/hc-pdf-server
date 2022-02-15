import { test } from 'tap'
import { InjectOptions, Response } from 'light-my-request'
import { app } from '../../src/app'
import { TEST_TARGET_URL } from '../../src/config'
// For occur TimeoutError: Navigation timeout
// https://stackoverflow.com/questions/100841/artificially-create-a-connection-timeout-error
const WRONG_TEST_URL = 'http://10.255.255.1/'

interface Test {
  teardown(cb: unknown): unknown
}
async function build(t: Test) {
  const myApp = await app({ pagesNum: 3, pageTimeoutMilliseconds: 2000 })
  t.teardown(myApp.close.bind(myApp))
  return myApp
}

test('success after 10 times timeout requests ', async (t) => {
  t.test('GET / with wrong url', async (t) => {
    const app = await build(t)
    const responses: Promise<Response>[] = []
    for (let i = 0; i < 10; i++) {
      responses.push(
        app.inject({
          method: 'GET',
          url: '/',
          query: {
            url: WRONG_TEST_URL,
          },
        } as InjectOptions)
      )
    }
    const results = await Promise.all(responses)
    for (const r of results) {
      t.equal(r.statusCode, 500)
    }
    const successRes = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        url: TEST_TARGET_URL,
      },
    } as InjectOptions)
    t.equal(successRes.statusCode, 200)
    t.end()
  })
})
