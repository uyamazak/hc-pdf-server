import { test } from 'tap'
import { HCPages } from '../../src/plugins/hc-pages'

test('enable options', async (t) => {
  const pagesNum = 5
  const hcPages = new HCPages({
    pagesNum: pagesNum,
    userAgent: 'user_agent_test',
    pageTimeoutMilliseconds: 30000,
    emulateMediaTypeScreenEnabled: true,
    acceptLanguage: 'ja',
  })
  await hcPages.init()
  t.equal((await hcPages.createPages()).length, pagesNum)
  await hcPages.destroy()
})
