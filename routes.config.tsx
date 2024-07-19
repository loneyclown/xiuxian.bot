import { createRequire } from 'module'
import { dirname, join } from 'path'
import React from 'react'
import { defineConfig } from 'react-puppeteer'
import { BagComponent } from './xiuxian/component/src/component'

import * as DB from 'xiuxian-db'

import * as Server from 'xiuxian-statistics'
import * as GameApi from 'xiuxian-core'

// import './xiuxian/db/src/main.js'

const require = createRequire(import.meta.url)

const data = await Server.backpackInformation(
  '183A8B8763929D396712ED8FBC5BB05F',
  'https://q.qlogo.cn/qqapp/102052769/183A8B8763929D396712ED8FBC5BB05F/640',
  GameApi.Goods.mapType['材料']
)

export default defineConfig([
  {
    url: '/bag',
    options: {
      join_dir: 'BagComponent',
      html_name: `BagComponent.html`,
      // 别名
      file_paths: {
        // '@xiuxian': join(dirname(require('../../../README.md')), 'public')
      },
      // 别名资源
      html_files: [require(`./public/css/root-dark.css`)],
      // 头部插入其他资源
      html_head: (
        <link rel="stylesheet" href={require(`./public/css/new-bag.css`)} />
      ),
      html_body: <BagComponent data={data} />
    }
  }
])
