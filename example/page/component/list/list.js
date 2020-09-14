/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// page/component/list/list.js
import AdobeSDK from '../../.././lib/adobe/AdobeSDK.js'
var app = getApp()
Page({
  data:{
    itemList: app.globalData.itemList
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    AdobeSDK.trackState('product list page', {
      "cdata.pagename":"product list page",
        "cdata.sitesection":"plp",
        "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
        "cdata.wechatunionid": "[WECHAT UNION ID]",
        "cdata.language":"en",
        "cdata.environment":"stg",});
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})