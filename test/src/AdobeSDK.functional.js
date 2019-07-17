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

describe('AdobeSDK Functional Tests  ', () => {
    beforeEach(() => {
        if (AdobeSDK.amsdk.started) {
            delete require.cache[require.resolve('../../src/AdobeSDK')];
            AdobeSDK = require('../../src/AdobeSDK');
            assert(!AdobeSDK.amsdk.started);
        }
        if (wx.map) wx.map.clear();
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
                    assert(obj.data.includes('LaunchEvent=LaunchEvent'));
                    assert(obj.data.includes('OSVersion=ios%2010.12&DeviceName=iphone%20xr&Resolution=800x600&RunMode=Application&PlatformVersion=wechat-1.5.0&AppId=adobe-demo%20(0.0.0.1)'));
                    assert(obj.data.includes('InstallDate='));
                    assert(obj.data.includes('Launches=1'));
                    assert(obj.data.includes('DaysSinceFirstUse=0&DaysSinceLastUse=0&MonthlyEngUserEvent=MonthlyEngUserEvent&DailyEngUserEvent=DailyEngUserEvent'));
                    assert(obj.data.includes('HourOfDay='));
                    assert(obj.data.includes('DayOfWeek='));
                    assert(obj.data.includes('action=Lifecycle'));
                    assert(obj.data.includes('TimeSinceLaunch=0'));
                    assert(obj.data.includes('pe=lnk_o&pev2=ADBINTERNAL%3ALifecycle'));
                    assert(obj.data.includes('pageName=adobe-demo%20(0.0.0.1)'));
                    assert(obj.data.includes('aid=1234-5678-90'));
                    assert(obj.data.includes('ts='));
                    assert(obj.data.includes('cp=foreground'));
                    obj.success({});
                    WxStub.restore();
                    wx.onAppShow.restore();
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
        });
        it('should not send analytics hits (LaunchEvent), if we relaunch test app before session timeout', (done) => {
            let onShowFn = null;
            let onHideFn = null;
            let hits = 0;
            let WxStub = sinon.stub(wx, 'request').callsFake(obj => {
                if (obj.url === 'https://test.sc.adobedc.cn/id') {
                    obj.success({
                        data: {
                            id: '1234-5678-90'
                        }
                    });
                }
                if (obj.url.startsWith('https://test.sc.adobedc.cn/b/ss/mobile5wechat.explore/0/wechat-1.0.0-beta')) {
                    hits++;
                    obj.success({});
                    if (hits === 1) onHideFn();
                }
            });
            sinon.stub(wx, 'onAppShow').callsFake(fn => {
                onShowFn = fn;
            });
            sinon.stub(wx, 'onAppHide').callsFake(fn => {
                onHideFn = fn;
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
            setTimeout(() => { onShowFn(); }, 100);
            setTimeout(() => {
                WxStub.restore();
                wx.onAppShow.restore();
                wx.onAppHide.restore();
                assert.equal(hits, 1);
                done();
            }, 150);

        });
        it('should send analytics hits (LaunchEvent), if we relaunch test app after session timeout', (done) => {
            let onShowFn = null;
            let onHideFn = null;
            let hits = 0;
            let WxStub = sinon.stub(wx, 'request').callsFake(obj => {
                if (obj.url === 'https://test.sc.adobedc.cn/id') {
                    obj.success({
                        data: {
                            id: '1234-5678-90'
                        }
                    });
                }
                if (obj.url.startsWith('https://test.sc.adobedc.cn/b/ss/mobile5wechat.explore/0/wechat-1.0.0-beta')) {
                    hits++;
                    obj.success({});
                    if (hits === 1) {
                        assert(obj.data.includes('InstallEvent=InstallEvent'));
                        assert(obj.data.includes('LaunchEvent=LaunchEvent'));
                        onHideFn();
                    }
                    if (hits === 2) {
                        assert(!obj.data.includes('InstallEvent=InstallEvent'));
                        assert(obj.data.includes('LaunchEvent=LaunchEvent'));

                        WxStub.restore();
                        wx.onAppShow.restore();
                        wx.onAppHide.restore();
                        done();
                    }
                }
            });
            sinon.stub(wx, 'onAppShow').callsFake(fn => {
                onShowFn = fn;
            });
            sinon.stub(wx, 'onAppHide').callsFake(fn => {
                onHideFn = fn;
            });
            AdobeSDK.init({
                "analytics.server": "test.sc.adobedc.cn",
                "analytics.rsids": "mobile5wechat.explore",
                "app.id": "adobe-demo",
                "app.version": "0.0.0.1",
                "analytics.offlineEnabled": true,
                "session.timeout": 1
            });
            onShowFn();
            setTimeout(() => { onShowFn(); }, 1800);
        });
        it('should send analytics hits (LaunchEvent), if we relaunch test app after an app crash', (done) => {
            let onShowFn = null;
            let hits = 0;
            let WxStub = sinon.stub(wx, 'request').callsFake(obj => {
                if (obj.url === 'https://test.sc.adobedc.cn/id') {
                    obj.success({
                        data: {
                            id: '1234-5678-90'
                        }
                    });
                }
                if (obj.url.startsWith('https://test.sc.adobedc.cn/b/ss/mobile5wechat.explore/0/wechat-1.0.0-beta')) {
                    hits++;
                    obj.success({});
                    if (hits === 1) {
                        assert(obj.data.includes('InstallEvent=InstallEvent'));
                        assert(obj.data.includes('LaunchEvent=LaunchEvent'));
                    }
                    if (hits === 2) {
                        assert(!obj.data.includes('InstallEvent=InstallEvent'));
                        assert(obj.data.includes('LaunchEvent=LaunchEvent'));

                        WxStub.restore();
                        wx.onAppShow.restore();
                        done();
                    }
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
                "session.timeout": 1
            });
            onShowFn();
            setTimeout(() => { onShowFn(); }, 1800);
        });
        it('should send analytics hits (UpgradeEvent & LaunchEvent), if we bump up version of test app ( 0.0.1 - 0.0.2 )', (done) => {
            let onShowFn = null;
            let onHideFn = null;
            let hits = 0;
            let WxStub = sinon.stub(wx, 'request').callsFake(obj => {
                if (obj.url === 'https://test.sc.adobedc.cn/id') {
                    obj.success({
                        data: {
                            id: '1234-5678-90'
                        }
                    });
                }
                if (obj.url.startsWith('https://test.sc.adobedc.cn/b/ss/mobile5wechat.explore/0/wechat-1.0.0-beta')) {
                    hits++;
                    obj.success({});
                    if (hits === 1) {
                        assert(obj.data.includes('InstallEvent=InstallEvent'));
                        assert(obj.data.includes('LaunchEvent=LaunchEvent'));
                        onHideFn();
                        if (AdobeSDK.amsdk.started) {
                            delete require.cache[require.resolve('../../src/AdobeSDK')];
                            AdobeSDK = require('../../src/AdobeSDK');
                            assert(!AdobeSDK.amsdk.started);
                            AdobeSDK.init({
                                "analytics.server": "test.sc.adobedc.cn",
                                "analytics.rsids": "mobile5wechat.explore",
                                "app.id": "adobe-demo",
                                "app.version": "0.0.0.2",
                                "analytics.offlineEnabled": true,
                                "session.timeout": 1
                            });
                        }
                    }
                    if (hits === 2) {
                        assert(obj.data.includes('UpgradeEvent=UpgradeEvent'));
                        assert(obj.data.includes('LaunchEvent=LaunchEvent'));
                        assert(obj.data.includes('LaunchesSinceUpgrade=1'));
                        assert(obj.data.includes('DaysSinceLastUpgrade=0'));

                        WxStub.restore();
                        wx.onAppShow.restore();
                        wx.onAppHide.restore();
                        done();
                    }
                }
            });
            sinon.stub(wx, 'onAppShow').callsFake(fn => {
                onShowFn = fn;
            });
            sinon.stub(wx, 'onAppHide').callsFake(fn => {
                onHideFn = fn;
            });
            AdobeSDK.init({
                "analytics.server": "test.sc.adobedc.cn",
                "analytics.rsids": "mobile5wechat.explore",
                "app.id": "adobe-demo",
                "app.version": "0.0.0.1",
                "analytics.offlineEnabled": true,
                "session.timeout": 10
            });
            onShowFn();
            setTimeout(() => { onShowFn(); }, 1800);
        });
    });
    describe('# public API : track action & track state', () => {
        it('should send analytics hits (track action), if we call public API => trackAction()', (done) => {
            let onShowFn = null;
            let hits = 0;
            let WxStub = sinon.stub(wx, 'request').callsFake(obj => {
                if (obj.url === 'https://test.sc.adobedc.cn/id') {
                    obj.success({
                        data: {
                            id: '1234-5678-90'
                        }
                    });
                }
                if (obj.url.startsWith('https://test.sc.adobedc.cn/b/ss/mobile5wechat.explore/0/wechat-1.0.0-beta')) {
                    hits++;
                    obj.success({});
                    if (hits === 1) {
                        assert(obj.data.includes('InstallEvent=InstallEvent'));
                        assert(obj.data.includes('LaunchEvent=LaunchEvent'));
                    }
                    if (hits === 2) {
                        assert(!obj.data.includes('LaunchEvent=LaunchEvent'));
                        assert(obj.data.includes('OSVersion=ios%2010.12&DeviceName=iphone%20xr&Resolution=800x600&RunMode=Application&PlatformVersion=wechat-1.5.0&AppId=adobe-demo%20(0.0.0.1)'));
                        assert(obj.data.includes('action=Start'));
                        assert(obj.data.includes('&k=value'));
                        assert(obj.data.includes('TimeSinceLaunch='));
                        assert(obj.data.includes('&pe=lnk_o&pev2=AMACTION%3AStart'));
                        assert(obj.data.includes('pageName=adobe-demo%20(0.0.0.1)'));
                        assert(obj.data.includes('aid=1234-5678-90'));
                        assert(obj.data.includes('ts='));
                        assert(obj.data.includes('cp=foreground'));
                        WxStub.restore();
                        wx.onAppShow.restore();
                        done();
                    }

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
            setTimeout(() => { AdobeSDK.trackAction('Start', { k: 'value' }); }, 10);

        });
        it('should send analytics hits (track state), if we call public API => trackState()', () => {
            let onShowFn = null;
            let hits = 0;
            let WxStub = sinon.stub(wx, 'request').callsFake(obj => {
                if (obj.url === 'https://test.sc.adobedc.cn/id') {
                    obj.success({
                        data: {
                            id: '1234-5678-90'
                        }
                    });
                }
                if (obj.url.startsWith('https://test.sc.adobedc.cn/b/ss/mobile5wechat.explore/0/wechat-1.0.0-beta')) {
                    hits++;
                    obj.success({});
                    if (hits === 1) {
                        assert(obj.data.includes('InstallEvent=InstallEvent'));
                        assert(obj.data.includes('LaunchEvent=LaunchEvent'));
                    }
                    if (hits === 2) {
                        assert(!obj.data.includes('LaunchEvent=LaunchEvent'));
                        assert(obj.data.includes('OSVersion=ios%2010.12&DeviceName=iphone%20xr&Resolution=800x600&RunMode=Application&PlatformVersion=wechat-1.5.0&AppId=adobe-demo%20(0.0.0.1)'));
                        assert(obj.data.includes('&k=value'));
                        assert(obj.data.includes('TimeSinceLaunch='));
                        assert(obj.data.includes('&pe=lnk_o&pev2=AMACTION%3AStart'));
                        assert(obj.data.includes('pageName=HomePage'));
                        assert(obj.data.includes('aid=1234-5678-90'));
                        assert(obj.data.includes('ts='));
                        assert(obj.data.includes('cp=foreground'));
                        WxStub.restore();
                        wx.onAppShow.restore();
                        done();
                    }

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
            setTimeout(() => { AdobeSDK.trackState('HomePage', { k: 'value' }); }, 10);
        });
    });

});