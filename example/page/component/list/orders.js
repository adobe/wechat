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

// page/component/orders/orders.js
import AdobeSDK from '../../.././lib/adobe/AdobeSDK.js'

var app = getApp()
Page({
  data:{
    address:{},
    hasAddress: false,
    total:0,
    orders:[
        {id:1,title:'新鲜芹菜 半斤',image:'/image/s5.png',num:4,price:0.01},
        {id:2,title:'素米 500g',image:'/image/s6.png',num:1,price:0.03}
      ]
  },

  onReady() {
    this.getTotalPrice();
  },
  
  onShow:function(){
    this.setData({
      orders: app.globalData.itemList
    });
    let products=""
    for(let i=0;i<app.globalData.itemList.length;i++)
    {
    if(app.globalData.itemList[i].num>0)
    {
 products=products+",;"+app.globalData.itemList[i].sku+";;;;eVar21="+app.globalData.itemList[i].sku+"|eVar22="+app.globalData.itemList[i].title+"|eVar23="+app.globalData.itemList[i].category+"|eVar24="+app.globalData.itemList[i].brand
    }
  }
      AdobeSDK.trackState('order detail page', {
      "cdata.pagename":"order detail page",
        "cdata.sitesection":"order",
        "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
        "cdata.wechatunionid": "[WECHAT UNION ID]",
        "cdata.language":"en",
        "cdata.environment":"stg",
        "&&products": products,
        "cdata.ctaname": "order detail"
          });
        },
  /**
   * 计算总价
   */
  getTotalPrice() {
    let orders = this.data.orders;
    let total = 0;
    for(let i = 0; i < orders.length; i++) {
      total += orders[i].num * orders[i].price;
    }
    this.setData({
      total: total
    })
  },

  toPay() {
    //let orders = [];
    app.globalData.itemList.forEach(function(item){
      item.selected=true;
      if(item.num > 0){
        app.globalData.orderList.push({
          image: item.image,
          name: item.title,
          count: item.num,
          status: 'Pending Payment'
        })
        item.num = 0;
      }
      //app.globalData.orderList = orders;
    })
    let products=""
    for(let i=0;i<app.globalData.itemList.length;i++)
    {
    if(app.globalData.itemList[i].num>0)
    {
 products=products+",;"+app.globalData.itemList[i].sku+";;;;eVar21="+app.globalData.itemList[i].sku+"|eVar22="+app.globalData.itemList[i].title+"|eVar23="+app.globalData.itemList[i].category+"|eVar24="+app.globalData.itemList[i].brand
    }
  }
   AdobeSDK.trackAction('confirm order', {
    "cdata.pagename":"order detail page",
    "cdata.sitesection":"order",
    "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
    "cdata.wechatunionid": "[WECHAT UNION ID]",
    "cdata.language":"en",
    "cdata.environment":"stg",
    "&&products": products,
    "cdata.ctaname": "confirm order"});
    wx.switchTab({
      url: '/page/component/user/user'
    })
  }
})