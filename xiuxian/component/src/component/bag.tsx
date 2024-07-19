import React from 'react'
import { hash } from 'alemonjs'

const Item = ({ label, value, suf = '%' }) => {
  if (!value) {
    return null
  }
  return (
    <div>
      {label}: {value}
      {suf}
    </div>
  )
}

export default function App({ data }) {
  const UID = isNaN(Number(data.UID)) ? hash(data.UID) : data.UID
  return (
    <div id="root">
      <nav className="nav">
        <div className="nav-left">
          <div className="user_top_right_font0 font_control Horizontal_grid">
            {UID}
          </div>
          <div className="user_top_right_font1 font_control Horizontal_grid">
            道号: {data.name}
          </div>
          <div className="user_top_right_font font_control Horizontal_grid">
            等级: {data.bag_grade}
          </div>
          <div
            className="user_top_right_font2 font_control Horizontal_grid"
            style={{ borderBottomRightRadius: '0px' }}
          >
            格子: {data.length}/{data.bag_grade * 10}
          </div>
        </div>
      </nav>
      <main className="main">
        {data.bag.map((item, index) => (
          <div key={index} className="main-item">
            <div className="user_top_right_font0 font_control Horizontal_grid">
              {/* {item['good.name']} */}
              {item['name']}
            </div>
            <div className="user_top_right_font1 main-item-content">
              <Item label="攻击" value={item['good.attack']} />
              <Item label="防御" value={item['good.defense']} />
              <Item label="血量" value={item['good.blood']} />
              <Item label="天赋" value={item['good.size']} />
              <Item label="暴击" value={item['good.critical_hit']} />
              <Item label="暴伤" value={item['good.critical_damage']} />
              <Item label="敏捷" value={item['good.speed']} suf="" />
              <Item label="等级" value={item['good.grade']} suf="" />
              <Item label="数量" value={item['acount']} suf="" />
              <Item label="灵石" value={item['good.price']} suf="" />
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
