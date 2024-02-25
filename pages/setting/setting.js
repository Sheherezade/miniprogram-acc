import PubSub from 'pubsub-js';
// pages/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onClickClearCache(){
    wx.showModal({
      content: '确认清空记录吗?',
      success: (res)=>{
        if(res.confirm){
          wx.removeStorageSync('csvData');
          wx.reLaunch({
            url: '/pages/service/service',
          });
        }
      }
    })
  },

  onClickShowOrder(){
    wx.navigateTo({
      url: '/pages/order/order'
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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