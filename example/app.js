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
      "analytics.server": "demo",
      "analytics.rsids": "demo",
      "app.id": "adobe-demo",
      "app.version": "0.0.0.3",
      "analytics.offlineEnabled": true,
      "session.timeout": 5
    });
    AdobeSDK.trackAction("Start", { "example.key": "value" });
    // let count = 20;
    // while(count>0){
    //   AdobeSDK.trackAction("Start", { "example.key": "value" })
    //   count--;
    // }

  },
  onShow: function () {
    console.log('App Show')
    let obj = wx.getStorageSync('hideAction');
    console.log('+++++++++ ',obj);

  },
  onHide: function () {
    let obj = wx.getStorageSync('hideAction')
    if(!obj) obj =[];
    let date = new Date().toLocaleString();
    obj.push({
      date,
      msg: 'onHide'
    });
    
    wx.setStorageSync('hideAction',obj);


  },
  globalData: {
    hasLogin: false,
    itemList: [
      { sku: 0, title: 'Photoshop', name: 'photoshop', image: '/image/s4.png', price: 0.01, num: 0, selected: true },
      { sku: 1, title: 'Lightroom', name: 'lightroom', image: '/image/s5.png', price: 0.25, num: 0, selected: true },
      { sku: 2, title: 'Illustrator', name: 'illustrator', image: '/image/s6.png', price: 0.03, num: 0, selected: true },
      { sku: 3, title: 'Invision', name: 'invision', image: '/image/s7.png', price: 0.05, num: 0, selected: true }
    ],
    orderList: []
  }
})
