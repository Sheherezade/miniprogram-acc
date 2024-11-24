const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { nickname } = event;

  try {
    const result = await db
      .collection('user_game_list') // 替换为你的集合名称
      .where({ name : nickname }) // 根据昵称查询
      .get();

  
    // 返回查询结果的数据数组
    return {
      success: true,
      data: result.data, // 返回所有匹配结果
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err.message,
    };
  }
};