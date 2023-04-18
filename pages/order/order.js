// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
        // 小程序前端代码
    wx.cloud.callFunction({
      name: 'getCollectionData',
      success: (res) => {
        // 处理获取到的集合数据
        if(res.result.hasOwnProperty('error'))
        {
          wx.navigateBack({
            delta: 1
          })
          wx.showToast({
            title: '无权限',
            icon: 'none'
          })
          console.log(res.result)
        }
        else{
          this.setData({
            order_list: res.result.data
          })
        }
      },
    })
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
  onShareAppMessage() {

  }
})