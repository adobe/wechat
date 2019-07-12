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

import assert from "assert";
import sinon from "sinon";
const {
    registerAppEvent
} = require('../../../src/Lifecycle/AppLifecyceRegister');

describe('test Lifecycle/AppLifecyceRegister.js', function () {
    describe('#registerAppEvent()', function () {
        it('should register onShow, onHide, onError event of the App', function () {
            sinon.spy(wx, 'onAppShow');
            sinon.spy(wx, 'onAppHide');
            sinon.spy(wx, 'onError');
            registerAppEvent({
                process: () => {}
            });
            let spy_onAppShow = wx.onAppShow.getCall(0);
            assert(typeof spy_onAppShow.args[0] == 'function');
            let spy_onAppHide = wx.onAppHide.getCall(0);
            assert(typeof spy_onAppHide.args[0] == 'function');
            wx.onAppShow.restore();
            wx.onAppHide.restore();
            wx.onError.restore();
        });
    });

});