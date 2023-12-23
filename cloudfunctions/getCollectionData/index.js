// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext() // 获取调用云函数的用户 openid
  const db = cloud.database()
  const collection = db.collection('gm')
  const adminInfo = await collection.where({
    openid: OPENID // 根据用户 openid 查询管理员信息
  }).get()

  if (adminInfo.data.length > 0) {
    const collection = db.collection('user_game_list')
    const data = await collection.get()
    return data
    }
    else {
      return {
        error: 'No permission'
      }
  }
}