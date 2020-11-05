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

const AdobeSDK = require('./lib/adobe/AdobeSDK.js');

App({
  onLaunch(options) {
    // try{
    AdobeSDK.setDebugLoggingEnabled(true)
    AdobeSDK.setDebugModeEnabled(true);
    AdobeSDK.init({
      "analytics.server": "test.sc.adobedc.cn",
      "analytics.rsids": "zhouchun-adobe-miniprogram",
      "app.id": "adobe-demo",
      "app.version": "0.0.0.3",
      "analytics.offlineEnabled": true,
      "session.timeout": 5
    });
    // let count = 20;
    // while(count>0){
    //   AdobeSDK.trackAction("Start", { "example.key": "value" })
    //   count--;
    // }
    const self = this;
    var userInfo_iv
    var userInfo_encryptedData;
 
    //Login
    wx.login({
      success: logres => {
        console.log("logres:");
        console.log(logres);
        console.log("logres.code:" + logres.code);

        wx.request({
          url: 'https://api.weixin.qq.com/sns/jscode2session?appid=wx509b0a684661746b&secret=7f7a67a9b7670e5e1ae0e2b8071c3b0a&grant_type=authorization_code&js_code=' + logres.code, 
          success (res) {
            console.log("getting openID===>"+res.data.openid);
            var openId = res.data.openid;
            wx.setStorageSync('wechatopenid', openId)
            wx.getUserInfo({
              withCredentials: true,
              success: infores => {
                console.log("infores.encryptedData===>" + infores.encryptedData)
                console.log("infores.iv:" + infores.iv)
                userInfo_encryptedData = infores.encryptedData
                userInfo_iv = infores.iv
        
                var WXBizDataCrypt = require('./WXBizDataCrypt')
                var appId = wx.getAccountInfoSync().miniProgram.appId
                // var sessionKey = 't2P\/iEiJT5Tnu8XwQS68+Q==';
                var sessionKey = res.data.session_key;
                var encryptedData = userInfo_encryptedData
                var iv = userInfo_iv
                var pc = new WXBizDataCrypt(appId, sessionKey)
                var data = pc.decryptData(encryptedData, iv)
                console.log('解密后 data: ', data);
                var wechatopenid = JSON.parse(data).openId
                //Set WeChat Open ID in local storage
                 wx.setStorageSync('wechatopenid', wechatopenid)

                //Send Adobe trackAction call after Wechat Open ID is set in local storage 
                AdobeSDK.trackAction("Start", {
                  "wechatopenid": wx.getStorageSync('wechatopenid')
                });
              }
            });
          }
        });

      }
    });
  },
  onShow: function () {
    console.log('App Show')
    let obj = wx.getStorageSync('hideAction');
    console.log('+++++++++ ', obj);

  },
  onHide: function () {
    let obj = wx.getStorageSync('hideAction')
    if (!obj) obj = [];
    let date = new Date().toLocaleString();
    obj.push({
      date,
      msg: 'onHide'
    });

    wx.setStorageSync('hideAction', obj);


  },
  globalData: {
    hasLogin: false,
    itemList: [{
        sku: 0,
        title: 'PhotoShop 7.0',
        name: 'Seeds',
        image: '/image/s4.png',
        price: 998,
        num: 0,
        category: 'Creative Cloud',
        brand: 'Adobe',
        selected: true
      },
      {
        sku: 1,
        title: 'Adobe AA',
        name: 'Celery',
        image: '/image/s5.png',
        price: 2100,
        num: 0,
        category: 'Experience Cloud',
        brand: 'Adobe',
        selected: true
      },
      {
        sku: 2,
        title: 'Adobe AEM',
        name: 'Rice',
        image: '/image/s6.png',
        price: 1800,
        num: 0,
        category: 'Experience Cloud',
        brand: 'Adobe',
        selected: true
      },
      {
        sku: 3,
        title: 'Adobe AI',
        name: 'Dates',
        image: '/image/s7.png',
        price: 9000,
        num: 0,
        category: 'Creative Cloud',
        brand: 'Adobe',
        selected: true
      }
    ],
    orderList: []
  }
})