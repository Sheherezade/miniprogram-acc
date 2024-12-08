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

      // 构建文件路径，这里假设文件名是 gameId + 序号.jpg
      const folderPath = `cloud://cloud1-2gajjosv8b2840db.636c-cloud1-2gajjosv8b2840db-1317345751/images/${gameId}/`;  // 你的文件夹路径

      // 假设文件夹内有 5 张图片，文件名是 1.jpg, 2.jpg, ... 5.jpg
      const filePaths = [];
      for (let i = 1; i <= 10; i++) {
        filePaths.push(`${folderPath}${i}.jpg`);  // 拼接每个图片的路径
      }

      // 使用 wx.cloud.getTempFileURL 获取文件的临时链接
      const fileUrls = await cloud.getTempFileURL({
        fileList: filePaths
      });

      // 过滤掉加载失败的文件
      const validUrls = fileUrls.fileList
      .filter(file => !file.error && file.tempFileURL)  // 过滤掉错误和没有 URL 的文件
      .map(file => file.tempFileURL);  // 获取成功加载的临时文件 URL
    const defaultImageUrl = `cloud://cloud1-2gajjosv8b2840db.636c-cloud1-2gajjosv8b2840db-1317345751/images/default.jpg`;
    if(validUrls.length <= 0)
    {
      validUrls.push(defaultImageUrl);
    }
    // 如果查询到数据
    if (res.data.length > 0) {
        
      const info = res.data[0];

        // 返回临时链接
        return {
          success: true,
          gameImages: validUrls,  // 返回图片临时链接
          gameDescription: info.gameDescription
        };
    } else {
      
      const tip = "漓墨白正在努力添加中...";
      return {
        success: true,
        gameImages: validUrls,  // 返回图片临时链接
        gameDescription: tip
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
