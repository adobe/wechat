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

// page/component/new-pages/user/user.js
import AdobeSDK from '../../.././lib/adobe/AdobeSDK.js'

var app = getApp()
Page({
  data:{
    thumb:'',
    nickname:'',
    orders:[],
    hasAddress:false,
    address:{}
  },
  onShow(){
    //app.globalData.orderList
    this.setData({
      orders: app.globalData.orderList
    });
    AdobeSDK.trackState('order success page', {
      "cdata.pagename":"order success page",
        "cdata.sitesection":"order",
        "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
        "cdata.wechatunionid": "[WECHAT UNION ID]",
        "cdata.language":"en",
        "cdata.environment":"stg",
        "cdata.ctaname": "order success"
          });
  },
  /**
   * 发起支付请求
   */
  payOrders(){
    AdobeSDK.trackAction('proceed to pay', {
      "cdata.pagename":"order success page",
        "cdata.sitesection":"order",
        "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
        "cdata.wechatunionid": "[WECHAT UNION ID]",
        "cdata.language":"en",
        "cdata.environment":"stg",
        "cdata.ctaname": "proceed to pay"
    });
    let flag = wx.getSystemInfoSync().brand === 'devtools'?false:true
    console.log(flag)
    if (flag){
      wx.showModal({
        title: 'Payment Result',
        content: 'Successful Payment',
        showCancel: false
      })
    }else{
      wx.requestPayment({
        timeStamp: 'String1',
        nonceStr: 'String2',
        package: 'String3',
        signType: 'MD5',
        paySign: 'String4',
        success: function (res) {
          console.log(res)
        },
        fail: function (res) {
          wx.showModal({
            title: 'Payment Result',
            content: 'Successful Payment',
            showCancel: false
          })
        }
      })
    }
    
  }
})