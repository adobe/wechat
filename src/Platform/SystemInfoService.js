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

class SystemInfoService {
    constructor() { }
    getSystemInfo() {
        let wxSysInfo = wx.getSystemInfoSync();
        let reolution = wxSysInfo['windowHeight'] + 'x' + wxSysInfo['windowWidth'];
        let data = {};
        data["a.OSVersion"] = wxSysInfo['system'];
        data["a.DeviceName"] = wxSysInfo['model'];
        data["a.Resolution"] = reolution;
        data["a.RunMode"] = "Application";
        data["a.PlatformVersion"] = 'wechat-' + wxSysInfo['version'];
        return data;
    }

}
module.exports = new SystemInfoService();