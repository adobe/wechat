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

// page/component/details/details.js
import AdobeSDK from '../../.././lib/adobe/AdobeSDK.js'
var app = getApp()
Page({
  data:{
    goods: {},
    num: 1,
    totalNum: 0,
    hasCarts: false,
    curIndex: 0,
    show: false,
    scaleCart: false
  },
  
  onLoad: function (options){
    let item = app.globalData.itemList[options.sku];
    this.setData({
      goods: {
        sku: item.sku,
        image: item.image,
        title: item.title,
        name: item.name,
        price: item.price,
        stock: 'In Stock',
        detail: 'This is the detail information of the product。',
        parameter: '$998/item',
        service: 'Returning goods service is unsupported.'
      }
    });
    AdobeSDK.trackState("pdp:" + item.title,{
      "cdata.pagename":"pdp:" + item.title,
      "cdata.sitesection":"pdp",
      "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
      "cdata.wechatunionid": "[WECHAT UNION ID]",
      "cdata.language":"en",
      "cdata.environment":"stg",
      "cdata.productFindingMethod":"[PRODUCT FINDING METHOD]",
"&&products":";"+item.sku+";;;;eVar21="+item.sku+"|eVar22="+item.title+"|eVar23="+item.category+"|eVar24="+item.brand,
"cdata.ctaname":"product view"});
      },

  addCount() {
    let num = this.data.num;
    num++;
    this.setData({
      num : num
    })
  },

  lessCount() {
    let num = this.data.num;
    num--;
    this.setData({
      num: num
    })
  },

  addNumber() {
    const self = this;
    const num = this.data.num;
    let total = this.data.totalNum;

    self.setData({
      show: true
    })
    setTimeout( function() {
      self.setData({
        show: false,
        scaleCart : true
      })
      setTimeout( function() {
        self.setData({
          scaleCart: false,
          hasCarts : true,
          totalNum: num + total
        })
      }, 200)
    }, 300)
    AdobeSDK.trackAction('add to cart',{
      "cdata.cartAddValue":this.data.goods.price,
      "&&products":";"+this.data.goods.sku+";;;;eVar21="+this.data.goods.sku+"|eVar22="+this.data.goods.title+"|eVar23="+this.data.goods.category+"|eVar24="+this.data.goods.brand,
      "cdata.ctaname":"add to cart"});    
  },
  addToCart(){
    if(this.data.totalNum>0){
      console.log('total num :'+ this.data.totalNum + '  sku is:' + this.data.goods.sku)
      let item = app.globalData.itemList[this.data.goods.sku];
      item.num += this.data.totalNum
      wx.switchTab({
        url: '/page/component/cart/cart'
      })
    }
       
  },
  bindTap(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      curIndex: index
    })
  }
 
})