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

// page/component/new-pages/cart/cart.js
import AdobeSDK from '../../.././lib/adobe/AdobeSDK.js'
var app = getApp()
Page({
  data: {
    carts:[],               // 购物车列表
    hasList:false,          // 列表是否有数据
    totalPrice:0,           // 总价，初始为0
    selectAllStatus:true,    // 全选状态，默认全选
    obj:{
        name:"hello"
    }
  },
  onShow() {
    console.log(app.globalData.itemList)
    this.setData({
      hasList: true,
      carts: app.globalData.itemList
    });
    if (this.nothingToShow()) {
      this.setData({ hasList: false })
    }
    this.getTotalPrice();
    let products=""
    for(let i=0;i<app.globalData.itemList.length;i++)
    {
    if(app.globalData.itemList[i].num>0)
    {
 products=products+",;"+app.globalData.itemList[i].sku+";;;;eVar21="+app.globalData.itemList[i].sku+"|eVar22="+app.globalData.itemList[i].title+"|eVar23="+app.globalData.itemList[i].category+"|eVar24="+app.globalData.itemList[i].brand
    }
  }
    AdobeSDK.trackState('cart detail page', {
    "cdata.pagename":"cart detail page",
      "cdata.sitesection":"cart",
      "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
      "cdata.wechatunionid": "[WECHAT UNION ID]",
      "cdata.language":"en",
      "cdata.environment":"stg",
      "&&products": products,
      "cdata.ctaname":"cart view"});
  },
  /**
   * 当前商品选中事件
   */
  selectList(e) {
    const index = e.currentTarget.dataset.index;
    let carts = app.globalData.itemList;
    const selected = carts[index].selected;
    carts[index].selected = !selected;
    this.setData({
      carts: carts
    });
    this.getTotalPrice();
  },

  /**
   * 删除购物车当前商品
   */
  deleteList(e) {
    const index = e.currentTarget.dataset.index;
    let carts = app.globalData.itemList;
    carts[index].num = 0;
    this.setData({
      carts: carts
    });
    if (this.nothingToShow()){
      this.setData({
        hasList: false
      });
    }else{
      this.getTotalPrice();
    }
    AdobeSDK.trackAction('remove from cart', {
    "cdata.pagename":"cart detail page",
      "cdata.sitesection":"cart",
      "cdata.wechatopenid": wx.getStorageSync('wechatopenid'),
      "cdata.wechatunionid": "[WECHAT UNION ID]",
      "cdata.language":"en",
      "cdata.environment":"stg",
"&&products":";"+carts[index].sku+";;;;eVar21="+carts[index].sku+"|eVar22="+carts[index].title+"|eVar23="+carts[index].category+"|eVar24="+carts[index].brand,
"cdata.ctaname":"remove from cart"
  });
  },

  nothingToShow(){
    let list = app.globalData.itemList;
    for (let i=0;i<list.length;i++){
      if(list[i].num > 0){
        return false;
      }
    }
    return true;
  },

  /**
   * 购物车全选事件
   */
  selectAll(e) {
    let selectAllStatus = this.data.selectAllStatus;
    selectAllStatus = !selectAllStatus;
    let carts = this.data.carts;

    for (let i = 0; i < carts.length; i++) {
      carts[i].selected = selectAllStatus;
    }
    this.setData({
      selectAllStatus: selectAllStatus,
      carts: carts
    });
    this.getTotalPrice();
  },

  /**
   * 绑定加数量事件
   */
  addCount(e) {
    const index = e.currentTarget.dataset.index;
    let carts = app.globalData.itemList;
    let num = carts[index].num;
    num = num + 1;
    carts[index].num = num;
    this.setData({
      carts: carts
    });
    this.getTotalPrice();
  },

  /**
   * 绑定减数量事件
   */
  minusCount(e) {
    const index = e.currentTarget.dataset.index;
    const obj = e.currentTarget.dataset.obj;
    let carts = app.globalData.itemList;
    let num = carts[index].num;
    if(num <= 1){
      return false;
    }
    num = num - 1;
    carts[index].num = num;
    this.setData({
      carts: carts
    });
    this.getTotalPrice();
  },

  /**
   * 计算总价
   */
  getTotalPrice() {
    let carts = this.data.carts;                  // 获取购物车列表
    let total = 0;
    for(let i = 0; i<carts.length; i++) {         // 循环列表得到每个数据
      if(carts[i].selected) {                     // 判断选中才会计算价格
        total += carts[i].num * carts[i].price;   // 所有价格加起来
      }
    }
    this.setData({                                // 最后赋值到data中渲染到页面
      carts: carts,
      totalPrice: total.toFixed(2)
    });
  }

})