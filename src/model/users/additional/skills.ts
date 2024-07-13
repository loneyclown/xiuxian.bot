import {
  user_skills,
  goods,
  type UserSkillsType,
  type UserType
} from 'xiuxian-db'
import { talentSize } from '../base/talent.js'
import * as Users from '../index.js'

/**
 * 添加功法
 * @param UID
 * @param name
 */
export async function add(UID: string, name: string | string[]) {
  await user_skills.create({
    uid: UID,
    name
  } as UserSkillsType)
}

/**
 * 删除功法
 * @param UID
 * @param name
 */
export async function del(UID: string, name: string | string[]) {
  // 删除
  await user_skills.destroy({
    where: {
      uid: UID,
      name
    }
  })
}

/**
 * 得到功法信息
 * @param UID
 * @returns
 */
export async function get(UID: string) {
  const data: UserSkillsType[] = (await user_skills.findAll({
    where: {
      uid: UID
    },
    raw: true
  })) as any
  return data
}

/**
 * 更新天赋
 * @param UID
 * @returns
 */
export async function updataEfficiency(UID: string, talent: number[]) {
  // 统计
  let skill = 0
  const skills: UserSkillsType[] = (await user_skills.findAll({
    where: {
      uid: UID
    },
    include: {
      model: goods
    },
    raw: true
  })) as any
  for await (const item of skills) {
    skill += item['good.size']
  }
  // 统计灵根
  const size = talentSize(talent)
  // 更新用户
  await Users.update(UID, {
    talent: talent,
    talent_size: size + skill
  } as UserType)
  return true
}
