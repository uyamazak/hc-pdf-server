import { test } from 'tap'
import { InjectOptions } from 'light-my-request'
import { app } from '../../src/app'
import { TEST_POST_HTML, PAGES_NUM } from '../../src/config'

interface Test {
  teardown(cb: unknown): unknown
}
async function build(t: Test) {
  const myApp = await app({
    pagesNum: PAGES_NUM,
  })
  t.teardown(myApp.close.bind(myApp))
  return myApp
}

test('concurrency access test', async (t) => {
  t.test(
    `POST / concurrency access within PAGES_NUM with no error: ${PAGES_NUM}`,
    async (t) => {
      const app = await build(t)
      const param = {
        method: 'POST',
        url: '/',
        body: {
          html: TEST_POST_HTML,
        },
      } as InjectOptions
      const injects = Array.from({ length: PAGES_NUM }, (_, k) => k).map(() => {
        return app.inject(param)
      })
      const responses = await Promise.all(injects)
      for (const res of responses) {
        t.equal(res.statusCode, 200)
      }
      t.end()
    }
  )
})

test('concurrency access test 2', async (t) => {
  t.test(
    `POST / concurrency access within PAGES_NUM * 2 with no error: ${
      PAGES_NUM * 2
    }`,
    async (t) => {
      const app = await build(t)
      const param = {
        method: 'POST',
        url: '/',
        body: {
          html: TEST_POST_HTML,
        },
      } as InjectOptions
      const injects = Array.from({ length: PAGES_NUM * 2 }, (_, k) => k).map(
        () => {
          return app.inject(param)
        }
      )
      const responses = await Promise.all(injects)
      for (const res of responses) {
        t.equal(res.statusCode, 200)
      }
      t.end()
    }
  )
})
