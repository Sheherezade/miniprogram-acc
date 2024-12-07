// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const res = await db.collection('article')
      .aggregate()        // 启用聚合查询
      .sort({ date: -1 })  // 排序
      .end();             // 结束聚合查询并返回结果
    return {
      success: true,
      data: res.list
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
