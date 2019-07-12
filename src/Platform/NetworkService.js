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

const logService = require('./LogService');
const LOG = logService;

class NetworkService {

  constructor() { }

  request(params) {

    if (!params || !params.url || params.url.length == 0) {
      LOG.debug("Invalid request", params);
      if (params.fail) params.fail(`Invalid request ${params}`);
      return;
    }

    LOG.debug("Sending request", params);
    wx.request({
      url: params.url,
      method: params.method || 'GET',
      data: params.data,
      header: params.header || {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        LOG.debug("Request success", res);
        if (params.success) params.success(res);
      },
      fail: function (res) {
        LOG.debug("Request failed", res);
        if (params.fail) params.fail(res);
      },
      complete: function () {
        LOG.debug("Request complete");
        if (params.complete) params.complete();
      }
    });
  }

}
module.exports = new NetworkService();