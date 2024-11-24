import PubSub, { version } from 'pubsub-js';
let isSend = false;//函数节流使用
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sizeInfo:[
      { value: 47, des:'64g内存卡', limit: -1},
      { value: 106, des:'128g内存卡', limit: -1 },
      { value: 220, des:'256g(包含该目录所有已汉化游戏)', limit: 270}
    ],
    currentSelectSizeIdx: 0,//第几个
    currentSelectSize: 0,
    currentTotalSize:0,
    remainSize:0,
    selectGameCount:0,
    csvData: [],
    id2sizeMap: {},
    clientName: "",
    selectGameIds: [],
    showPage: false,
    name: '',
    version:0,
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
  bindPickerChange(e) {
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
            console.log('下载文件内容：', data);

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

  onClickGoTo()
  {
    const windowHeight = wx.getSystemInfoSync().windowHeight;
    
    // 滚动到底部
    wx.createSelectorQuery().selectViewport().scrollOffset().exec(function(res) {
      const scrollHeight = res[0].scrollHeight; // 获取内容的总高度
      const scrollTop = scrollHeight - windowHeight; // 目标滚动位置

      // 滚动到底部
      wx.pageScrollTo({
        scrollTop: scrollTop,
        duration: 500 // 滚动动画时长
      });
    });
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
    var time = new Date().getTime();
    const db = wx.cloud.database()
    db.collection('user_game_list').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        name,
        game_list : selectGameIds.join(','),
        time,
        size: this.data.currentSelectSizeIdx,
        total_size : this.data.currentTotalSize
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
    let { csvData,selectGameIds,selectGameCount } = this.data;
    const csv_idx = csvData.findIndex(obj => obj.id === id);

    if(selectGameIds.includes(id))
    {
      const idx = selectGameIds.indexOf(id);
      selectGameIds.splice(idx, 1);
      selectGameCount--;
      csvData[csv_idx].checked = false;
    }
    else{
      const idx = this.data.currentSelectSizeIdx;
      const limit = this.data.sizeInfo[idx].limit;
      const value = this.data.sizeInfo[idx].value;
      if(limit > 0 && selectGameCount >= limit)
      {
        csvData[csv_idx].checked = false;
        this.showToast('不可超过' + limit  +'个游戏')
        this.setData({csvData});
        return;
      }

      if(!this.calcuSize())
      {
        csvData[csv_idx].checked = false;
        this.setData({csvData});
        return;
      }
  
      selectGameIds.push(id);
      selectGameCount++;
      csvData[csv_idx].checked = true;
    }
    this.setData({
      selectGameIds,
      selectGameCount,
      csvData
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
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.download();
    this.updateSelectSize();
  },

  download()
  {
    // 本地有版本号就检测一下版本号，没有的话就直接判断csv的存在逻辑
    wx.getStorage({
      key: 'version',
      success: res => {
        this.checkVersion(res.data);
      },
      fail: err => {
        this.checkDownloadCsv();
        wx.cloud.callFunction({
          name: 'getVersion', // 云函数的名称
          success: res => {
            this.saveVersion(res.result.content);
          },
          fail: err => {
            console.error('云函数调用失败', err)
          }
        })
      }
    });
  },

  checkDownloadCsv()
  {
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
  },

  saveVersion(version)
  {
    wx.setStorage({
      key: 'version',
      data: version,
      success: () => {
        console.log('版本存储成功',version);
      },
      fail: err => {
        console.error('版本存储失败', err);
      }
    });
  },

  checkVersion(local_version)
  {
    console.log('开始校验版本')
    wx.cloud.callFunction({
      name: 'getVersion', // 云函数的名称
      success: res => {
        console.log('服务器版本',res.result.content)
        console.log('本地版本',local_version)
        // 远端版本更新 直接下载
        if(local_version == undefined ||res.result.content > local_version)
        {
          console.log('远端版本更新，开始下载')
          this.startDownload();
          this.saveVersion(res.result.content);
        }
        else{
          this.checkDownloadCsv();
        }
      },
      fail: err => {
        console.error('云函数调用失败', err)
      }
    })
  }
})

class CsvRow {
  constructor(id, name, size, sizeInfo) {
    this.id = id;
    this.name = name;
    this.size = size;
    this.sizeInfo = sizeInfo;
    this.checked = false;
  }
}