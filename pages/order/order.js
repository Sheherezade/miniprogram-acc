import {formatNum,formatTime} from "../../utils/common.js"
// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_list:[],
    size_info:[
      '64g内存卡',
      '128g内存卡',
      '256g内存卡'
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
          res.result.data.map(item=>{
            item.time=formatTime(item.time,3)
             // 确保 total_size 是数字，然后保留两位小数
            item.total_size = (Number(item.total_size) / 1024 || 0).toFixed(2);
          })
          this.setData({
            order_list: res.result.data.map(item => {
              // 将字符串分割为数组并计算长度
              item.game_list_length = item.game_list.split(',').length;
              return item;
            })
          });
        }
      },
    })
  },

  toggleGameList(e) {
    const index = e.currentTarget.dataset.index;  // 获取当前点击项的索引
    const orderList = this.data.order_list;

    // 直接修改对应项的 showGameList
    orderList[index].showGameList = !orderList[index].showGameList;

    // 更新 order_list 数据
    this.setData({
      order_list: orderList  // 更新整个 order_list
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
})