import koaRouter from 'koa-router'
import { ERROE_CODE, OK_CODE } from '../../config/ajax'
import { AssType, UserAssType, ass, user, user_ass } from '../../../src/db'
import { GameApi } from '../../../src/api'
const router = new koaRouter({ prefix: '/api/v1/ass' })

// 势力列表
router.get('/list', async ctx => {
  try {
    let { page, pageSize } = ctx.query
    if (!page) page = '0'
    if (!pageSize) pageSize = '10'

    const { rows, count } = await ass.findAndCountAll({
      offset: Number(page),
      limit: Number(pageSize)
    })
    ctx.body = {
      code: OK_CODE,
      data: rows,
      total: count
    }
  } catch (err) {
    ctx.body = {
      code: ERROE_CODE,
      msg: err.message
    }
  }
})

// 申请加入
router.post('/join', async ctx => {
  try {
    const { assId } = ctx.request.body as any
    const UID = ctx.state.user.uid
    const UserAss: UserAssType = (await user_ass.findOne({
      where: {
        uid: UID,
        identity: GameApi.Config.ASS_IDENTITY_MAP['0']
      },
      raw: true
    })) as any
    if (UserAss) {
      ctx.body = {
        code: ERROE_CODE,
        msg: '已创建个人势力,无法申请加入其他势力'
      }
      return
    }

    const aData: AssType = (await ass.findOne({
      where: {
        id: assId
      },
      raw: true
    })) as any

    if (!aData) {
      ctx.body = {
        code: ERROE_CODE,
        msg: '不存在该势力'
      }
      return
    }
    /**
     * 检测是否已提交申请
     */
    const joinData: UserAssType = (await user_ass.findOne({
      where: {
        uid: UID,
        aid: aData.id,
        identity: GameApi.Config.ASS_IDENTITY_MAP['9']
      },
      raw: true
    })) as any
    if (joinData) {
      ctx.body = {
        code: ERROE_CODE,
        msg: '已提交申请，请勿重复提交'
      }
      return
    }

    /**
     * 创建信息条目
     */
    await user_ass.create({
      create_tiime: new Date().getTime(),
      uid: UID,
      aid: aData.id,
      authentication: 9,
      identity: GameApi.Config.ASS_IDENTITY_MAP['9']
    })

    ctx.body = {
      code: OK_CODE,
      msg: '申请成功'
    }
  } catch (err) {
    ctx.body = {
      code: ERROE_CODE,
      msg: err.message
    }
  }
})

/**
 * 势力管理
 */
// 我的势力
router.get('/my', async ctx => {
  try {
    const UID = ctx.state.user.uid
    const userASS: UserAssType[] = (await user_ass.findAll({
      where: {
        uid: UID
      }
    })) as any
    ctx.body = {
      code: OK_CODE,
      data: userASS
    }
  } catch (err) {
    ctx.body = {
      code: ERROE_CODE,
      msg: err.message
    }
  }
})

// 势力详情
router.get('/detail', async ctx => {
  try {
    const { assId } = ctx.query
    const aData: AssType = (await ass.findOne({
      where: {
        id: assId
      },
      raw: true
    })) as any
    if (!aData) {
      ctx.body = {
        code: ERROE_CODE,
        msg: '不存在该势力'
      }
      return
    }
    ctx.body = {
      code: OK_CODE,
      data: aData
    }
  } catch (err) {
    ctx.body = {
      code: ERROE_CODE,
      msg: err.message
    }
  }
})

// 势力成员
router.get('/member', async ctx => {
  try {
    const { assId } = ctx.query
    const aData: AssType = (await ass.findOne({
      where: {
        id: assId
      },
      raw: true
    })) as any
    if (!aData) {
      ctx.body = {
        code: ERROE_CODE,
        msg: '不存在该势力'
      }
      return
    }
    const userASS: UserAssType[] = (await user_ass.findAll({
      where: {
        aid: aData.id
      }
    })) as any
    ctx.body = {
      code: OK_CODE,
      data: userASS
    }
  } catch (err) {
    ctx.body = {
      code: ERROE_CODE,
      msg: err.message
    }
  }
})

// 势力申请列表
router.get('/join-list', async ctx => {
  try {
    const { assId } = ctx.query
    if (!assId) {
      ctx.body = {
        code: ERROE_CODE,
        msg: '请传入势力id'
      }
      return
    }
    const aData: AssType = (await ass.findOne({
      where: {
        id: assId
      },
      raw: true
    })) as any
    if (!aData) {
      ctx.body = {
        code: ERROE_CODE,
        msg: '不存在该势力'
      }
      return
    }
    const userASS: UserAssType[] = (await user_ass.findAll({
      where: {
        aid: aData.id,
        identity: GameApi.Config.ASS_IDENTITY_MAP['9']
      }
    })) as any
    ctx.body = {
      code: OK_CODE,
      data: userASS
    }
  } catch (err) {
    ctx.body = {
      code: ERROE_CODE,
      msg: err.message
    }
  }
})

export default router
