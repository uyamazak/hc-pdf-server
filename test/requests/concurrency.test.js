'use strict'

import { test } from 'tap'
import { app } from '../../dist/app'
import { TEST_POST_HTML, PAGES_NUM } from '../../dist/config'

async function build(t) {
  const myApp = await app()
  t.tearDown(myApp.close.bind(myApp))
  t.tearDown(async () => await myApp.destoroyHcPages())
  return myApp
}

test('concurrency access test', async (t) => {
  t.test(
    `POST / concurrency access within PAGES_NUM: ${PAGES_NUM}`,
    async (t) => {
      const app = await build(t)
      const param = {
        method: 'POST',
        url: '/',
        body: {
          html: TEST_POST_HTML,
        },
      }
      const injects = Array.from(Array(PAGES_NUM).keys()).map(() => {
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
