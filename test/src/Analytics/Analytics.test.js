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
import chai from 'chai';
import sinon from "sinon";
const Analytics = require('../../../src/Analytics/Analytics');
import {
    InvalidDataKeyException
} from '../../../src/Common/InvalidDataKeyException';
const {
    InvalidArgumentException
} = require('../../../src/Common/InvalidArgumentException');
const EventProcessor = require('../../../src/Common/EventProcessor');


const DEFAULT_CONFIGURATION = {
    name: 'amsdk.configuration',
    data: {
        contextdata: {
            "analytics.server": "test.sc.adobedc.cn",
            "analytics.rsids": "mobile5wechat.explore",
            "analytics.offlineEnabled": false,
            "app.id": "sample-app-001",
            'app.version': '1.1.0',
            'session.timeout': 10
        }
    }

};

const EVENT_PROCESSOR = new EventProcessor();

function buildAnalytics() {
    let WxStub = sinon.stub(wx, 'getStorageSync');
    WxStub.withArgs('adobe.analytics.aid').returns('11111111');
    let analytics = new Analytics(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
    WxStub.restore();
    return analytics;
}

describe('test Analytics/Analytics.js', () => {
    describe('# constructor()', () => {
        it('should throw exception, if no configuraiton or eventProcessor provided', () => {
            try {
                new Analytics();
            } catch (e) {
                assert(e instanceof InvalidArgumentException);
            }
            chai.expect(() => new Analytics()).to.throw('fail to initialize Analytics object, as configuraiont or event processor is not set correctly.');
            buildAnalytics();
            assert(true);
        });
    });
    describe('# _loadAid()', () => {
        it('should load aid from local storage, if key [adobe.analytics.aid] exists.', () => {
            const AID = '12345590804854';
            let WxStub = sinon.stub(wx, 'getStorageSync');
            WxStub.withArgs('adobe.analytics.aid').returns(AID);
            let analytics = new Analytics(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            analytics._loadAid();
            assert.equal(analytics.context.aid, AID);
            WxStub.restore();
        });
        it('should try to retrieve aid from remote server, if key [adobe.analytics.aid] not exist.', () => {
            let analytics = buildAnalytics();
            analytics.context.aid = null;
            let WxStub = sinon.stub(wx, 'getStorageSync');
            WxStub.withArgs('adobe.analytics.aid').returns(null);
            let getAidStub = sinon.stub(analytics, '_getAidFromServer');
            getAidStub.returns({});
            analytics._loadAid();
            assert(getAidStub.calledOnce);
            getAidStub.restore();
            WxStub.restore();
        });
    });
    describe('# _saveAid()', () => {
        it('should save aid to local storage', () => {
            let analytics = buildAnalytics();
            let WxSpy = sinon.spy(wx, 'setStorageSync');
            analytics._saveAid(12345);
            WxSpy.calledWith('adobe.analytics.aid', 12345);
            WxSpy.restore();
        });
    });

    describe('# _getAidFromServer()', () => {
        it('should firstly retrieve aid from remote serfver', () => {
            let analytics = buildAnalytics();
            var WxFake = sinon.fake.returns({});
            sinon.replace(wx, 'request', WxFake);
            analytics._getAidFromServer();
            let args = WxFake.getCall(0).lastArg;
            // console.log(args);
            assert.equal(args.url, 'https://test.sc.adobedc.cn/id');
            assert.equal(args.method, 'GET');
            assert.deepEqual(args.header, { 'content-type': 'application/x-www-form-urlencoded' });
            sinon.restore();
        });
    });
    describe('# _generateAid()', () => {
        it('should return aid with right format like xxxxxxxxx-xxxxxxxxx', () => {
            let analytics = buildAnalytics();
            let aid = analytics._generateAid();
            chai.assert.match(aid, /^[0-7]([0-9]|[A-F]){15}-[0-3]([0-9]|[A-F]){15}$/);
        });
    });
    describe('# _getUrl()', () => {
        it('should return url', () => {
            let analytics = buildAnalytics();
            let url = analytics._getUrl(DEFAULT_CONFIGURATION.data.contextdata);
            assert(url.startsWith('https://test.sc.adobedc.cn/b/ss/mobile5wechat.explore/0/wechat-1.0.0-beta/s'));
        });
    });
    describe('# process(event)', () => {
        it('should update configuration, when process get called with configuration event data.', () => {
            let analytics = buildAnalytics();
            let confEvent = {
                name: 'amsdk.configuration',
                data: {
                    contextdata: {
                        "analytics.server": "test.sc.adobedc.cn",
                        "analytics.rsids": "test-rsids",
                        "analytics.offlineEnabled": false,
                        "app.id": "sample-app-001",
                        'app.version': '1.1.0',
                        'session.timeout': 10
                    }
                }

            };
            analytics.process(confEvent);
            assert.equal(analytics.confContextData['analytics.rsids'], 'test-rsids');
        });
        it('should cached events, when aid is not ready', () => {
            let analytics = buildAnalytics();
            analytics.context.aid = null;
            let event1 = { name: 'xx1' };
            let event2 = { name: 'xx2' };
            let event3 = { name: 'xx3' };
            analytics.process(event1);
            analytics.process(event2);
            analytics.process(event3);
            assert.equal(analytics.cachedEvents.length, 3);
        });
        it('should send lifecycle event, when process get called', () => {
            let analytics = buildAnalytics();
            let event = {
                name: 'amsdk.lifecycle',
                action: "Lifecycle",
                data: {
                    contextdata: {
                        'a.DailyEngUserEvent': "DailyEngUserEvent",
                        'a.DayOfWeek': 2,
                        'a.DaysSinceFirstUse': 22,
                        'a.DaysSinceLastUpgrade': 22,
                        'a.DaysSinceLastUse': 0,
                        'a.HourOfDay': 15,
                        'a.LaunchEvent': "LaunchEvent",
                        'a.Launches': 2,
                        'a.LaunchesSinceUpgrade': 1,
                        'a.MonthlyEngUserEvent': "MonthlyEngUserEvent",
                        'a.UpgradeEvent': "UpgradeEvent"
                    }
                }
            };
            let WxSpy = sinon.spy(wx, 'request');
            analytics.process(event);
            let arg = WxSpy.args[0][0];
            assert(arg.data.indexOf('&LaunchEvent=LaunchEvent') > 0);
            WxSpy.restore();
        });
        it('should send analytics hit, when process get called with track action event', () => {
            let analytics = buildAnalytics();
            let event = {
                name: 'amsdk.analytics.action',
                data: {
                    action: 'launchAppAction',
                    contextdata: { key1: 'value1', key2: 'value2' }
                }
            };
            let WxSpy = sinon.spy(wx, 'request');
            analytics.process(event);
            let arg = WxSpy.args[0][0];
            assert(arg.data.indexOf('action=launchAppAction') > 0);
            WxSpy.restore();
        });
        it('should send analytics hit, when process get called with track state event', () => {
            let analytics = buildAnalytics();
            let event = {
                name: 'amsdk.analytics.state',
                data: {
                    state: 'MainPage',
                    contextdata: { key1: 'value1', key2: 'value2' }
                }
            };
            let WxSpy = sinon.spy(wx, 'request');
            analytics.process(event);
            let arg = WxSpy.args[0][0];
            assert(arg.data.indexOf('pageName=MainPage') > 0);
            WxSpy.restore();
        });
    });
});