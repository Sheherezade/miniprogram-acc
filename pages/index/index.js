// index.js
Page({
  data: {
    bannerList:[
      {
        pic: 'cloud://cloud1-2gajjosv8b2840db.636c-cloud1-2gajjosv8b2840db-1317345751/images/course_1.jpg'
      },
      {
        pic: 'cloud://cloud1-2gajjosv8b2840db.636c-cloud1-2gajjosv8b2840db-1317345751/images/course_2.jpg'
      },
      {
        pic: 'cloud://cloud1-2gajjosv8b2840db.636c-cloud1-2gajjosv8b2840db-1317345751/images/course_3.jpg'
      }
    ],//轮播图数据
  },

  onClickGameSelect()
  {
    wx.navigateTo({
      url: '/pages/service/service',
    });
  },


  onClickLog()
  {
    wx.navigateTo({
      url: '/pages/log/log',
    });
  },

  onClickRecord()
  {
    wx.navigateTo({
      url: '/pages/record/record',
    });
  },

  onClickTutorial()
  {
    wx.navigateTo({
      url: '/pages/tutorial/tutorial',
    });
  },

  onClickLock(){
    this.showToast('暂未开放');
  },

  showToast(info){
    wx.showToast({
      title: info,
      icon: 'none',
      duration: 2000
    })
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
