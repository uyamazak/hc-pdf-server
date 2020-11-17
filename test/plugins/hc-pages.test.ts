import { test } from 'tap'
import { HCPages } from '../../src/plugins/hc-pages'

test('pageNumGenerator is working correctly', async (t) => {
  const pagesNum = 5
  const hcPages = new HCPages({
    pagesNum: pagesNum,
    userAgent: '',
    pageTimeoutMilliseconds: 30000,
    emulateMediaTypeScreenEnabled: '',
    acceptLanguage: '',
  })
  await hcPages.init()
  t.equal(hcPages.pageNumGenerator.next().value, 0)
  t.equal(hcPages.pageNumGenerator.next().value, 1)
  t.equal(hcPages.pageNumGenerator.next().value, 2)
  t.equal(hcPages.pageNumGenerator.next().value, 3)
  t.equal(hcPages.pageNumGenerator.next().value, 4)
  t.equal(hcPages.pageNumGenerator.next().value, 0)
  t.equal(hcPages.pageNumGenerator.next().value, 1)
  t.equal(hcPages.pageNumGenerator.next().value, 2)
  t.equal(hcPages.pageNumGenerator.next().value, 3)
  t.equal(hcPages.pageNumGenerator.next().value, 4)
  t.equal(hcPages.pageNumGenerator.next().value, 0)
  t.end()
  await hcPages.destoroy()
})

test('enable options', async (t) => {
  const pagesNum = 5
  const hcPages = new HCPages({
    pagesNum: pagesNum,
    userAgent: 'user_agent_test',
    pageTimeoutMilliseconds: 30000,
    emulateMediaTypeScreenEnabled: 'true',
    acceptLanguage: 'ja',
  })
  await hcPages.init()
  t.ok(hcPages.getCurrentPage())
  await hcPages.destoroy()
})
