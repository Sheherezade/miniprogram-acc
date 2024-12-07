// pages/tutorial/tutorial.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [] // 用于存储从云函数获取的文章数据
  },

  onItemClick(event) {
    const url = event.currentTarget.dataset.url;
    // 跳转到新的页面并传递 URL 参数
    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
    });
  },

  // 格式化日期
  formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  // 调用云函数获取文章数据
  wx.cloud.callFunction({
    name: 'getArticles',
    success: res => {
      if (res.result.success) {
        // 格式化日期
        const articles = res.result.data.map(article => ({
          ...article,
          date: this.formatDate(article.date)
        }));
        this.setData({
          items: articles
        });
      } else {
        // 获取失败，提示用户
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    },
    fail: err => {
      // 调用失败，提示用户
      wx.showToast({
        title: '调用失败',
        icon: 'none'
      });
    }
  });
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