// 获取云数据库实例
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logs: []  // 用于存储从云开发拉取的更新日志
  },

  // 获取更新日志数据
  fetchUpdateLogs: function() {
    db.collection('app_log')
    .where({
      enable: true  // 只获取 enable 为 true 的记录
    })
    .orderBy('time', 'desc')
    .get({
      success: res => {
        // 对拉取到的数据按时间进行排序
        const logs = res.data;
        // 将时间字符串转换为 Date 对象并进行排序
        logs.sort((a, b) => {
          const dateA = new Date(a.time.replace(/-/g, '/'));  // 将 "-" 替换为 "/"
          const dateB = new Date(b.time.replace(/-/g, '/'));
     
          return dateB - dateA;  // 降序排序
        });
        this.setData({
          logs: res.data  // 将拉取到的日志数据设置到页面数据中
        });
      },
      fail: err => {
        console.error('获取更新日志失败', err);
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchUpdateLogs();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

   /**
   * 用户点击右上角分享
   */
  onShareAppMessage(e) {    
    return {
      title:"漓墨白的未白镇"
    }
  },

  // 分享到朋友圈
  onShareTimeline(){
    return {
      title:"漓墨白的未白镇"
    }
  }
})