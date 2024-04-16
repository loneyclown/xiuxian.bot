import { APlugin, ClientNTQQ, Controllers, type AEvent } from 'alemonjs'
import {
  DB,
  GameApi,
  showUserMsg,
  Server,
  isUser,
  getEquipmentComponent,
  getSkillsComponent,
  createUser
} from '../../api/index.js'
import { Themes } from '../../component/core/color.js'
export class Information extends APlugin {
  constructor() {
    super({
      rule: [
        { reg: /^(#|\/)?(个人|個人)信息$/, fnc: 'personalInformation' },
        { reg: /^(#|\/)?面板信息$/, fnc: 'equipmentInformation' },
        { reg: /^(#|\/)?功法信息$/, fnc: 'skillInformation' },
        { reg: /^(#|\/)?我的编号$/, fnc: 'myUserID' },
        { reg: /^(#|\/)?控制板$/, fnc: 'controllers' },
        { reg: /^(#|\/)?更换主题$/, fnc: 'updateTheme' }
      ]
    })
  }

  /**
   *
   * @param e
   * @returns
   */
  async myUserID(e: AEvent) {
    e.reply(e.user_id)
    return
  }

  /**
   *
   * @param e
   * @returns
   */
  async controllers(e: AEvent) {
    Controllers(e).Message.reply(
      '',
      [
        { label: '个人信息', value: '/个人信息' },
        { label: '面板信息', value: '/面板信息' },
        { label: '功法信息', value: '/功法信息' }
      ],
      [
        { label: '探索灵矿', value: '/探索灵矿' },
        { label: '探索怪物', value: '/探索怪物' },
        { label: '释放神识', value: '/释放神识' }
      ],
      [
        { label: '虚空镜', value: '/虚空镜' },
        { label: '打坐', value: '/打坐' },
        { label: '闭关', value: '/闭关' },
        { label: '出关', value: '/出关' }
      ],
      [
        { label: '纳戒', value: '/纳戒' },
        { label: '突破', value: '/突破' },
        { label: '破境', value: '/破境' }
      ],
      [
        { label: '储物袋', value: '/储物袋' },
        { label: '修仙地图', value: '/修仙地图' },
        { label: '修仙帮助', value: '/修仙帮助' }
      ]
    )
    return true
  }

  /**
   *
   * @param e
   */
  async updateTheme(e: AEvent) {
    const UID = e.user_id
    isUser(UID)
      .then(UserData => {
        if (!UserData) {
          createUser(e)
          return
        }
        // 得到配置
        const index = Themes.indexOf(UserData.theme)
        // 如果存在
        if (Themes[index + 1]) {
          // 切换
          UserData.theme = Themes[index + 1]
          // 保存
        } else {
          // 不存在。返回第一个
          UserData.theme = Themes[0]
        }
        // 更新主题后。
        GameApi.Users.update(UID, {
          avatar: e.user_avatar,
          theme: UserData.theme
        } as DB.UserType).then(() => {
          Promise.all([
            GameApi.Skills.updataEfficiency(UID, UserData.talent),
            GameApi.Equipment.updatePanel(UID, UserData.battle_blood_now),
            showUserMsg(e)
          ]).catch(() => {
            e.reply('数据处理错误')
          })
        })
      })
      .catch(() => {
        e.reply('数据查询错误')
      })
  }

  /**
   * 个人信息
   * @param e
   * @returns
   */
  async personalInformation(e: AEvent) {
    const UID = e.user_id
    isUser(UID)
      .then(UserData => {
        if (!UserData) {
          createUser(e)
          return
        }
        GameApi.Users.update(UID, {
          avatar: e.user_avatar
        } as DB.UserType).then(() => {
          Promise.all([
            GameApi.Skills.updataEfficiency(UID, UserData.talent),
            GameApi.Equipment.updatePanel(UID, UserData.battle_blood_now),
            showUserMsg(e)
          ]).catch(() => {
            e.reply('数据处理错误')
          })
        })
      })
      .catch(() => {
        e.reply('数据查询错误')
      })

    return
  }

  /**
   * 面板信息
   * @param e
   * @returns
   */
  async equipmentInformation(e: AEvent) {
    const UID = e.user_id
    isUser(UID)
      .then(UserData => {
        if (!UserData) {
          createUser(e)
          return
        }
        GameApi.Equipment.updatePanel(UID, UserData.battle_blood_now).then(
          () => {
            Server.equipmentInformation(UID, e.user_avatar).then(res => {
              getEquipmentComponent(res, UID).then(img => {
                if (typeof img != 'boolean') {
                  e.reply(img)
                }
              })
            })
          }
        )
      })
      .catch(() => {
        e.reply('数据查询错误')
      })
    return
  }

  /**
   * 功法信息
   * @param e
   * @returns
   */
  async skillInformation(e: AEvent) {
    const UID = e.user_id
    isUser(UID)
      .then(UserData => {
        if (!UserData) {
          createUser(e)
          return
        }
        GameApi.Skills.updataEfficiency(UID, UserData.talent).then(() => {
          Server.skillInformation(UID, e.user_avatar).then(res => {
            getSkillsComponent(res, UID).then(img => {
              if (typeof img != 'boolean') {
                e.reply(img)
              }
            })
          })
        })
      })
      .catch(() => {
        e.reply('数据查询错误')
      })

    return
  }
}
