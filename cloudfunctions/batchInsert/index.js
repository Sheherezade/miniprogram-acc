// cloud function: batchInsertGames
const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();
const gamesCollection = db.collection('game_details');  // 假设你的集合名称是 'games'

exports.main = async (event, context) => {
  return;
  const totalRecords = 299;  // 总记录数
  const results  = [];

  // 构建批量插入的数据
  for (let i = 0 ; i <= totalRecords; i++) {
    const gameId = `DGCH${String(i).padStart(4, '0')}`;
    const gameData = {
      gameId: gameId,
      gameDescription: '<h1>漓墨白鸽鸽努力添加中(*^▽^*)<h1>',
    };
    try {
      // 插入每一条数据并等待其完成
      const res = await gamesCollection.add({
        data: gameData
      });
      results.push(res);  // 保存插入结果
    } catch (error) {
      return { success: false, error: error, index: i };
    }
  }

  // 所有插入完成
  return { success: true, data: results };
};
