// 云函数入口文件
const cloud = require('wx-server-sdk')
// 引入文件系统模块
const fs = require('fs');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
// 云函数入口函数
exports.main = async (event, context) => {
    try {
      // 获取文件 ID
      const fileID = 'cloud://cloud1-2gajjosv8b2840db.636c-cloud1-2gajjosv8b2840db-1317345751/version.txt';
  
      // 通过云开发获取文件临时链接
      const res = await cloud.getTempFileURL({
        fileList: [fileID]
      });
  
      // 获取临时链接
      const tempFileURL = res.fileList[0].tempFileURL;
  
      // 使用 HTTP GET 请求读取文件内容
      const https = require('https');
  
      return new Promise((resolve, reject) => {
        https.get(tempFileURL, function(response) {
          let data = '';
  
          // 将文件内容拼接到 data 变量中
          response.on('data', chunk => {
            data += chunk;
          });
  
          // 当文件内容读取完成后，将 data 变量作为结果返回
          response.on('end', () => {
            resolve({
              success: true,
              content: data
            });
          });
        }).on('error', err => {
          reject({
            success: false,
            errMsg: err.message
          });
        });
      });
    } catch (err) {
      return {
        success: false,
        errMsg: err.message
      };
    }
};
