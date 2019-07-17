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
var AdobeSDK = require('../../src/AdobeSDK');
const {
    InvalidArgumentException
} = require('../../src/Common/InvalidArgumentException');

describe('test ./AdobeSDK.js ', () => {
    beforeEach(() => {
        if (AdobeSDK.amsdk.started) {
            delete require.cache[require.resolve('../../src/AdobeSDK')];
            AdobeSDK = require('../../src/AdobeSDK');
            assert(!AdobeSDK.amsdk.started);
        }
        if (wx.map) wx.map.clear();
    });
    describe('# AdobeSDK - initialization ', () => {
        it('should initialize AdobeSDK, if the users provide valid configuraions', () => {
            let WxStub = sinon.stub(wx, 'request');
            WxStub.returns(0);
            AdobeSDK.setDebugModeEnabled(true);
            AdobeSDK.init({
                "analytics.server": "test.sc.adobedc.cn",
                "analytics.rsids": "mobile5wechat.explore",
                "app.id": "adobe-demo",
                "app.version": "0.0.0.1",
                "analytics.offlineEnabled": true,
                "session.timeout": 5
            });
            assert(AdobeSDK.amsdk.started);
            assert(WxStub.called);
            WxStub.restore();
        });
        it('should print error log and not call any internal function, if the users provide invalid configurations', () => {

            let WxStub = sinon.stub(wx, 'request');
            WxStub.returns(0);
            AdobeSDK.setDebugModeEnabled(true);
            try {
                AdobeSDK.init({
                    "analytics.server": "test.sc.adobedc.cn",
                    "app.id": "adobe-demo",
                    "app.version": "0.0.0.1",
                    "analytics.offlineEnabled": true,
                    "session.timeout": 5
                });
            } catch (e) {
                assert(e instanceof InvalidArgumentException);
            }
            assert(!AdobeSDK.amsdk.started);
            assert(!WxStub.called);
            WxStub.restore();
        });
    });
    describe('# Send Analytics hits with lifeycle data', () => {
        it('should send analytics hits (InstallEvent & LaunchEvent), if this is the first time to launch test app', (done) => {
            let onShowFn = null;
            let WxStub = sinon.stub(wx, 'request').callsFake(obj => {
                if (obj.url === 'https://test.sc.adobedc.cn/id') {
                    obj.success({
                        data: {
                            id: '1234-5678-90'
                        }
                    });
                }
                if (obj.url.startsWith('https://test.sc.adobedc.cn/b/ss/mobile5wechat.explore/0/wechat-1.0.0-beta')) {
                    assert(obj.data.includes('InstallEvent=InstallEvent'));
                    WxStub.restore();
                    done();
                }
            });
            sinon.stub(wx, 'onAppShow').callsFake(fn => {
                onShowFn = fn;
            });
            AdobeSDK.init({
                "analytics.server": "test.sc.adobedc.cn",
                "analytics.rsids": "mobile5wechat.explore",
                "app.id": "adobe-demo",
                "app.version": "0.0.0.1",
                "analytics.offlineEnabled": true,
                "session.timeout": 5
            });
            onShowFn();
            // WxStub.restore();
        });
        // it('should send analytcis hits (LaunchEvent), if this is the second time to launch test app', () => {

        // });
        // it('should not send analytics hits (LaunchEvent), if we relaunch test app before session timeout', () => {

        // });
        // it('should send analytics hits (LaunchEvent), if we relaunch test app after session timeout', () => {

        // });
        // it('should send analytics hits (LaunchEvent), if we relaunch test app after an app crash', () => {

        // });
        // it('should send analytics hits (UpgradeEvent & LaunchEvent), if we bump up version of test app ( 0.0.1 - 0.0.2 )', () => {

        // });
    });
    // describe('# public API : track action & track state', () => {
    //     it('should send analytics hits (track action), if we call public API => trackAction()', () => {

    //     });
    //     it('should send analytics hits (track state), if we call public API => trackState()', () => {

    //     });
    // });
    // describe('# public API : setDebugLoggingEnabled()', () => {
    //     it('should not print debug log, if setDebugLoggingEnabled(false)', () => {

    //     });
    // });
    // describe('# public API : setDebugModeEnabled()', () => {
    //     it('should not throw exceptions, if setDebugModeEnabled(false)', () => {

    //     });
    // });

});