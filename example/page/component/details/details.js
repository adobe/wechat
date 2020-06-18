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
        parameter: '125g/item',
        service: 'Returning goods service is unsupported.'
      }
    });
    AdobeSDK.trackState('ProductPage-' + item.name, {});
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
    AdobeSDK.trackAction('AddToCart',{})
    
  },
  bindTap(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      curIndex: index
    })
  }
 
})