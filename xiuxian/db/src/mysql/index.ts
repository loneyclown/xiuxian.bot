import { appendFile, mkdirSync } from 'fs'
import { join } from 'path'
import { Sequelize } from 'sequelize'

/**
 *
 * @param date
 * @returns
 */
function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

//
const dir = join(process.cwd(), 'logs', 'mysql')
mkdirSync(dir, {
  recursive: true
})

//
export const sequelize = new Sequelize(
  process.env?.ALEMONJS_MYSQL_DATABASE ?? 'xiuxian_bak',
  process.env?.ALEMONJS_MYSQL_USER ?? 'root',
  process.env?.ALEMONJS_MYSQL_PASSWORD ?? 'mysql_8P7dtZ',
  {
    host: process.env?.ALEMONJS_MYSQL_HOST ?? '121.36.252.193',
    port: Number(process.env?.ALEMONJS_MYSQL_PROT ?? 3306),
    dialect: 'mysql',
    logging: sql => {
      const TIME = new Date()
      const NOW = TIME.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
      appendFile(
        join(dir, `${formatDate(TIME)}.log`),
        `${NOW}\n${sql}\n`,
        err => {
          if (err) {
            console.error('Error writing to log file:', err)
          }
        }
      )
      return false
    }
  }
)
