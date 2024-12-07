// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { gameId } = event; // 获取传递过来的 gameId
  
  try {
    // 查询 game_detail 数据库，找到对应的游戏名称和介绍
    const res = await db.collection('game_details')
      .where({ gameId }) // 根据 gameId 查询
      .get();

    // 如果查询到数据
    if (res.data.length > 0) {
      const gameDetail = res.data[0];  // 获取第一个结果（假设 gameId 是唯一的）
      
      // 拼接云存储路径（根据你的存储路径规则）
      const gameImageUrl = `cloud://cloud1-2gajjosv8b2840db.636c-cloud1-2gajjosv8b2840db-1317345751/images/game/${gameId}.jpg`;

      return {
        success: true,
        gameImage: gameImageUrl,  // 返回拼接好的图片URL
        gameDescription: gameDetail.gameDescription
      };
    } else {

      const gameImageUrl = `cloud://cloud1-2gajjosv8b2840db.636c-cloud1-2gajjosv8b2840db-1317345751/images/game/default.jpg`;

      return {
        success: true,
        gameImage: gameImageUrl,
        gameDescription:  "漓墨白努力添加中...",
      };
    }
  } catch (err) {
    // 错误处理
    console.error('查询失败', err);
    return {
      success: false,
      message: '查询失败'
    };
  }
};
