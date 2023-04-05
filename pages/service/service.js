// pages/service.js
let isSend = false;//函数节流使用
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sizeInfo:[
      { value: 1, des:'64g内存卡' },
      { value: 128, des:'128g内存卡' },
      { value: 256, des:'256g内存卡' }
    ],
    currentSelectSizeIdx: 0,
    currentSelectSize: 0,
    csvData: [],
    id2sizeMap: {},
    clientName: "",
    selectGameIds: [],
    showPage: false,
    name: ''
  },

  // 初始化id2sizeMap
  initSizeMap(){
    let{ csvData,id2sizeMap } = this.data;
    csvData.forEach(function(row) {
      id2sizeMap[row.id] = row.size;
    });
    this.setData({
      id2sizeMap
    });
  },

  // 更新选择的内存卡容量
  updateSelectSize(){
    const idx = this.data.currentSelectSizeIdx;
    if(idx >= 0)
    {
      this.setData({
        currentSelectSize: this.data.sizeInfo[idx].value
      })
    }
  },

  // 选择内存卡容量事件
  bindPickerChange: function(e) {
    this.setData({
      currentSelectSizeIdx: e.detail.value
    })
    this.updateSelectSize();
  },

  // 开始从服务器下载csv
  startDownload() {
    wx.cloud.downloadFile({
      fileID: 'cloud://cloud1-2gajjosv8b2840db.636c-cloud1-2gajjosv8b2840db-1317345751/game.csv', // 文件 ID
      success: res => {
        const fs = wx.getFileSystemManager();
        fs.readFile({
          filePath: res.tempFilePath,
          encoding: 'utf8',
          success: res => {
            const data = res.data;
            console.log('文件内容：', data);

            const csv = require('papaparse');
            const result = csv.parse(data, {skipEmptyLines:true}).data;
            const csvData = result.map(row => 
            {
              const size = row[2].replace('MB', '').trim();
              return new CsvRow(row[0], row[1], size, row[2]);
            });

            console.log('转换成功', csvData);
            
            // 将转换后的数据存储到本地
            wx.setStorage({
              key: 'csvData',
              data: csvData,
              success: () => {
                console.log('数据存储成功');
              },
              fail: err => {
                console.error('数据存储失败', err);
              }
            });

            this.setData({
              csvData
            }, success => {
              this.initSizeMap();
            });
          },
          fail: err => {
            console.error('读取文件失败', err);
          }
        });
      },
      fail: err => {
        console.error('下载失败', err);
      }
    })
  },

  // 发送游戏清单
  onClickFinish(){
    if(!this.calcuSize())
    {
      return;
    }
    this.setData({
      showPage: true
    });
  },

  onClosePage(){
    this.setData({showPage:false});
  },

  onBindBlur(event){
    this.setData({
      name: event.detail.value.trim()
    });
  },

  onClickSend(){

    const { name, selectGameIds } = this.data;
    if(selectGameIds.length == 0)
    {
      wx.showToast({
        title: '请选择至少一个游戏',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if(name.length === 0)
    {
      wx.showToast({
        title: '请输入您的名字',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if(isSend){
      wx.showToast({
        title: '请不要频繁发送',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    isSend = true;

    // 入库
    const db = wx.cloud.database()
    db.collection('user_game_list').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        name,
        game_list : selectGameIds.join(',')
      }
    })
    .then(res => {
      console.log(res)
    })

    //函数节流
    setTimeout(() => {
      isSend = false;
    }, 5000);
    this.onClosePage();
  },

  // 选择一个游戏事件
  onClickGameItem(e){
    let { id } = e.currentTarget.dataset;//这里可以知道被改变的复选框的index
    let { selectGameIds } = this.data;
    if(selectGameIds.includes(id))
    {
      const idx = selectGameIds.indexOf(id);
      selectGameIds.splice(idx, 1);
    }
    else{
      selectGameIds.push(id);
    }
    this.setData({
      selectGameIds
    })
    this.calcuSize();
  },

  // 计算占用容量
  calcuSize(){
    let totalSize = 0;
    const { id2sizeMap,selectGameIds,currentSelectSize } = this.data;
    selectGameIds.forEach(function(id){
      if(id in id2sizeMap)
      {
        totalSize += parseFloat(id2sizeMap[id]);
      }
    });
    if(totalSize >= currentSelectSize * 1024)
    {
      wx.showToast({
        title: '游戏容量超出内存卡上限!',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return false;
    }
    return true;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 从本地读取 csv 数据
    wx.getStorage({
      key: 'csvData',
      success: res => {
        const csvData = res.data;
        console.log('数据读取成功', csvData);

        this.setData({
          csvData: csvData
        }, function() {
          this.initSizeMap();
        });
      },
      fail: err => {
        this.startDownload();
      }
    });
    this.updateSelectSize();
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

class CsvRow {
  constructor(id, name, size, sizeInfo) {
    this.id = id;
    this.name = name;
    this.size = size;
    this.sizeInfo = sizeInfo;
  }
}