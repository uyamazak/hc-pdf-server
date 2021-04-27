import { test } from 'tap'
import { InjectOptions } from 'light-my-request'
import { app } from '../../src/app'
import { TEST_TARGET_URL } from '../../src/config'

const BEARER_KEY = 'test-super-secret-key'
interface Test {
  teardown(cb: unknown): unknown
}
async function build(t: Test) {
  const myApp = await app({
    bearerAuthSecretKey: BEARER_KEY,
    pagesNum: 2,
  })
  t.teardown(myApp.close.bind(myApp))
  return myApp
}

test('bearer test', async (t) => {
  t.test('GET / without authorization header', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        url: TEST_TARGET_URL,
      },
    } as InjectOptions)
    t.equal(res.statusCode, 401)
    t.end()
  })

  t.test('GET / with wrong key', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        url: TEST_TARGET_URL,
      },
      headers: {
        Authorization: 'Bearer Super-Wrong-key',
      },
    })
    t.equal(res.statusCode, 401)
    t.end()
  })

  t.test('GET / with correct key', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        url: TEST_TARGET_URL,
      },
      headers: {
        Authorization: `Bearer ${BEARER_KEY}`,
      },
    })
    t.equal(res.statusCode, 200)
    t.end()
  })
})
