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
import AdobeSDK from '../.././lib/adobe/AdobeSDK.js'
var app = getApp()
Page({
  data: {
    imgUrls: [
      '/image/b1.jpg',
      '/image/b2.jpg',
      '/image/b3.jpg'
    ],
    indicatorDots: false,
    autoplay: false,
    interval: 3000,
    duration: 800,
    itemList: app.globalData.itemList
  },
     
  onLoad: function(){
         
  },
  onShow: function(){
    AdobeSDK.trackState("home",{
      "cdata.pagename":"home",
      "cdata.sitesection":"home",
      "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
      "cdata.wechatunionid": "[WECHAT UNION ID]",
      "cdata.location":"[LATITUDE|LONGITUDE]",
      "cdata.language":"en",
      "cdata.environment":"stg"});
      },
searchClick: function(){
  AdobeSDK.trackAction('proceed to search', {
    "cdata.pagename":"home",
      "cdata.sitesection":"home",
      "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
      "cdata.wechatunionid": "[WECHAT UNION ID]",
      "cdata.language":"en",
      "cdata.environment":"stg",
      "cdata.ctaname": "proceed to search"});
},
hotSelectionsClick: function(){
  AdobeSDK.trackAction('internal banner click', {
    "cdata.pagename":"home",
      "cdata.sitesection":"home",
      "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
      "cdata.wechatunionid": "[WECHAT UNION ID]",
      "cdata.language":"en",
      "cdata.environment":"stg",
      "cdata.bannerCode":"product listing banner",
      "cdata.bannerGroup":"hot selections",
      "cdata.ctaname":"internal banner click"
    });
},
newArrivalsClick: function(){
  AdobeSDK.trackAction('internal banner click', {
    "cdata.pagename":"home",
      "cdata.sitesection":"home",
      "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
      "cdata.wechatunionid": "[WECHAT UNION ID]",
      "cdata.language":"en",
      "cdata.environment":"stg",
      "cdata.bannerCode": "product detail banner",
      "cdata.bannerGroup":"new arrivals",
      "cdata.ctaname":"internal banner click"
    });
}
})
