import {formatNum,formatTime} from "../../utils/common.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickname: '',
    results: [], // 保存多个查询结果
    csvData: [], // 本地缓存中的 csv 数据
  },

   // 监听输入框变化
   onInput(e) {
    this.setData({
      nickname: e.detail.value,
    });
  },

  // 点击查询按钮
  async onQuery() {
    const { nickname } = this.data;
    if (!nickname) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({
      title: '查询中...',
    });

    wx.cloud
      .callFunction({
        name: 'queryRecord',
        data: { nickname },
      })
      .then((res) => {
        if (res.result.success) {
          const processedResults = res.result.data.map((item) => ({
            name: item.name, // 原始的 name 字段
            game_list: item.game_list,
            time: formatTime(item.time, 3)
          }));
          this.setData({
            results: processedResults,
          });
          this.processResults();
        } else {
          wx.showToast({
            title: '查询失败',
            icon: 'none',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        wx.showToast({
          title: '查询失败',
          icon: 'none',
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载本地缓存的 csvData
    const csvData = wx.getStorageSync("csvData") || [];
    this.setData({ csvData });
  },

  processResults() {
    const { results, csvData } = this.data;

    if (!csvData.length) {
      wx.showToast({ title: "缓存数据为空", icon: "none" });
      return;
    }
    // 将每个结果的 game_list 中的 id 转换为对应的游戏名称
    const processedResults = results.map(item => {
      const gameIds = item.game_list.split(",");  // 分割 game_list
      const games = gameIds.map(id => {
        const game = csvData.find(game => game.id === id); // 查找对应的游戏名称
        return game ? game.name : `未找到: ${id}`;  // 如果找到，返回游戏名称，否则返回未找到
      });
      return { ...item, game_list: games };  // 更新 game_list 为游戏名称数组
    });

    this.setData({ results: processedResults });
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