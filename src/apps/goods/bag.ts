import { APlugin, Controllers, type AEvent } from 'alemonjs'
import { isThereAUserPresent } from 'xiuxian-api'
import { picture } from 'xiuxian-component'

import * as GameApi from 'xiuxian-core'
import * as Server from 'xiuxian-statistics'

export class Bag extends APlugin {
  constructor() {
    super({
      rule: [
        {
          reg: /^(#|\/)?(储物袋|儲物袋|背包)(武器|护具|法宝|丹药|功法|道具|材料|装备)?$/,
          fnc: 'showBagType'
        },
        { reg: /^(#|\/)?(储物袋|儲物袋|背包)(升级|升級)$/, fnc: 'bagUp' },
        {
          reg: /^(#|\/)?(储物袋|儲物袋|背包)(丢弃|丟棄)[\u4e00-\u9fa5]+\*\d+$/,
          fnc: 'discard'
        }
      ]
    })
  }

  /**
   * 按类型显示储物袋
   * @param e
   * @returns
   */
  async showBagType(e: AEvent) {
    const UID = e.user_id
    if (!(await isThereAUserPresent(e, UID))) return
    const type = e.msg.replace(/^(#|\/)?(储物袋|儲物袋|背包)/, '')
    const data = await Server.backpackInformation(
      e.user_id,
      e.user_avatar,
      GameApi.Goods.mapType[type] ?? GameApi.Goods.mapType['道具']
    )
    const arr = data.bag.map(
      item =>
        `【${item.name}】: 数量${item.acount}。 ${item.doc ? item.doc : ''}`
    )

    if (e.platform == 'ntqq') {
      ;(Controllers(e).Message as any).markdown(
        {
          custom_template_id: '102052769_1716276531',
          params: [
            {
              key: 'story_title',
              values: ['储物袋']
            },
            {
              key: 'paragraph_content',
              values: [`***\r\r${arr.join('\r\r')}`]
            },
            {
              key: 'paragraph_option1',
              values: ['不要点，没有用']
            },
            {
              key: 'paragraph_option2',
              values: ['不要点，没有用']
            },
            {
              key: 'paragraph_option3',
              values: ['不要点，没有用']
            },
            {
              key: 'paragraph_option4',
              values: ['不要点，没有用']
            }
          ]
        },
        [
          { label: '武器', value: '/储物袋武器', enter: true },
          { label: '护具', value: '/储物袋护具', enter: true },
          { label: '法宝', value: '/储物袋法宝', enter: true },
          { label: '丹药', value: '/储物袋丹药', enter: true }
        ],
        [
          { label: '功法', value: '/储物袋功法', enter: true },
          { label: '道具', value: '/储物袋道具', enter: true },
          { label: '材料', value: '/储物袋材料', enter: true },
          { label: '装备', value: '/储物袋装备', enter: true }
        ],
        [
          { label: '升级', value: '/储物袋升级', enter: true },
          { label: '丢弃', value: '/储物袋丢弃' }
        ]
      )
    }

    // e.reply([`\n${arr.join('\n')}`], {
    //   quote: e.msg_id
    // })
    // if (e.platform == 'ntqq') {
    //   Controllers(e).Message.reply(
    //     '',
    //     [
    //       { label: '武器', value: '/储物袋武器', enter: true },
    //       { label: '护具', value: '/储物袋护具', enter: true },
    //       { label: '法宝', value: '/储物袋法宝', enter: true },
    //       { label: '丹药', value: '/储物袋丹药', enter: true }
    //     ],
    //     [
    //       { label: '功法', value: '/储物袋功法', enter: true },
    //       { label: '道具', value: '/储物袋道具', enter: true },
    //       { label: '材料', value: '/储物袋材料', enter: true },
    //       { label: '装备', value: '/储物袋装备', enter: true }
    //     ],
    //     [
    //       { label: '升级', value: '/储物袋升级', enter: true },
    //       { label: '丢弃', value: '/储物袋丢弃' },
    //     ],
    //   )
    // }
    // const img = await picture.render('BagComponent', {
    //   cssName: ['new-information', 'new-bag'],
    //   props: { data },
    //   name: UID
    // })
    // if (typeof img != 'boolean') e.reply(img)
    return
  }

  /**
   * 储物袋丢弃
   * @param e
   * @returns
   */
  async discard(e: AEvent) {
    const UID = e.user_id
    if (!(await isThereAUserPresent(e, UID))) return

    const [thingName, quantity] = e.msg
      .replace(/^(#|\/)?(储物袋|儲物袋|背包)(丢弃|丟棄)/, '')
      .split('*')

    const thing = await GameApi.Bag.searchBagByName(UID, thingName)
    if (!thing) {
      e.reply([`没[${thingName}]`], {
        quote: e.msg_id
      })
      return
    }
    await GameApi.Bag.reduceBagThing(UID, [
      {
        name: thing.name,
        acount: Number(quantity)
      }
    ])
    e.reply([`丢弃[${thingName}]*${Number(quantity)}`], {
      quote: e.msg_id
    })
    return
  }

  /**
   * 储物袋升级
   * @param e
   * @returns
   */
  async bagUp(e: AEvent) {
    const UID = e.user_id
    if (!(await isThereAUserPresent(e, UID))) return
    const UserData = await GameApi.Users.read(UID)
    let grade = UserData.bag_grade
    const Price = GameApi.Cooling.Price[grade]
    if (!Price) {
      e.reply(['已是极品储物袋'], {
        quote: e.msg_id
      })
      return
    }
    const thing = await GameApi.Bag.searchBagByName(UID, '下品灵石')
    if (!thing || thing.acount < Price) {
      e.reply([`灵石不足\n需要准备[下品灵石]*${Price}`], {
        quote: e.msg_id
      })
      return
    }
    // 加1
    grade++

    // 更新用户
    await GameApi.Users.update(UID, {
      bag_grade: grade
    })

    // 扣灵石
    await GameApi.Bag.reduceBagThing(UID, [
      {
        name: '下品灵石',
        acount: Price
      }
    ])
    e.reply([`花了${Price}*[下品灵石]升级\n目前储物袋等级为${grade}`], {
      quote: e.msg_id
    })
    return
  }
}
