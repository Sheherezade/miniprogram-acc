// pages/gameDetails.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameName: '',
    gameImages: [],
    gameDescription: '',
  },

  fetchGameDetails: function (gameId) {
    // 调用云函数获取游戏详情
    wx.cloud.callFunction({
      name: 'getGameDetails',
      data: { gameId },
      success: res => {
        if (res.result.success) {
          const { gameImages, gameDescription } = res.result;
          this.setData({
            gameImages,
            gameDescription,
          });
          console.log(gameDescription);
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none',
          });
        }
      },
      fail: err => {
        console.error('云函数调用失败', err);
        wx.showToast({
          title: '获取游戏详情失败',
          icon: 'none',
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    const gameId = options.id;  // 获取传递的 gameId

    // 加载本地缓存的 csvData
    const csvData = wx.getStorageSync("csvData") || [];
    const game = csvData.find(item => item.id === gameId);
    if (game) {
      this.setData({
        gameName: game.name,
      });
    }

    this.fetchGameDetails(gameId);
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

  },

  
  onNavigateBack() {
    wx.navigateBack();
  },
})