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
})
