import PubSub from 'pubsub-js';
let isSend = false;//函数节流使用
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sizeInfo:[
      { value: 47, des:'64g内存卡' },
      { value: 106, des:'128g内存卡' }
    ],
    currentSelectSizeIdx: 0,
    currentSelectSize: 0,
    currentTotalSize:0,
    remainSize:0,
    selectGameCount:0,
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
    this.calcuRemainSize();
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
      this.showToast('请选择至少一个游戏')
      return;
    }
    if(name.length === 0)
    {
      this.showToast('请输入您的名字');
      return;
    }
    if(isSend){
      this.showToast('请不要频繁发送');
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
      wx.showModal({
        content: '上传成功',
        showCancel: false
        });
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
    let { selectGameIds,selectGameCount } = this.data;
    if(selectGameIds.includes(id))
    {
      const idx = selectGameIds.indexOf(id);
      selectGameIds.splice(idx, 1);
      selectGameCount--;
    }
    else{
      selectGameIds.push(id);
      selectGameCount++;
    }
    this.setData({
      selectGameIds,
      selectGameCount
    })
    this.calcuSize();
    this.calcuRemainSize();
  },

  // 计算占用容量
  calcuSize(){
    let currentTotalSize = 0;
    const { id2sizeMap,selectGameIds,currentSelectSize } = this.data;
    selectGameIds.forEach(function(id){
      if(id in id2sizeMap)
      {
        currentTotalSize += parseFloat(id2sizeMap[id]);
      }
    });
    this.setData({ currentTotalSize });
    if(currentTotalSize >= currentSelectSize * 1024)
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

  calcuRemainSize(){
    let {currentTotalSize, currentSelectSize} = this.data;
    let remain = (currentSelectSize * 1024 - currentTotalSize)/1024;
    if(remain < 0)
    {
      remain = 0;
    }
    this.setData({
      remainSize: remain.toFixed(2)
    });
  },

  showToast(info){
    wx.showToast({
      title: info,
      icon: 'none',
      duration: 2000
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("到服务页面了");
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