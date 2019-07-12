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
const Lifecycle = require('../../../src/Lifecycle/Lifecycle');
const {
    localStorageService
} = require('../../../src/Platform/PlatformService');
const EventProcessor = require('../../../src/Common/EventProcessor');
const {
    InvalidArgumentException
} = require('../../../src/Common/InvalidArgumentException');

const DEFAULT_CONFIGURATION = {
    name: 'amsdk.configuration',
    data: {
        contextdata: {
            'name': 'amsdk.configuration',
            'app.version': '1.1.0',
            'session.timeout': 10
        }
    }

};
const DEFAULT_LOCAL_OBJ = {
    'install': {
        'first.install.date': null,
        'latest.install.date': null,
        'app.version': '1.0.0'
    },
    'upgrade': {
        'last.upgrade.date': null,
        'launches.since.last.upgrade': 10
    },
    'session.previous': {
        'amsdk.session.start.date': null,
        'amsdk.session.end.date': null
    },
    'session.current': {
        'amsdk.session.start.date': null,
        'amsdk.session.end.date': null
    },
    'latest.engaged.day': null,
    'latest.engaged.month': null,
    'launches': 100
};

const EVENT_PROCESSOR = new EventProcessor();

describe('test Lifecycle/Lifecycle.js', () => {
    beforeEach(() => {
        localStorageService.removeWhenExist('amsdk.lifecye.local');
    });
    describe('# constructor()', () => {
        it('should pass, if configuration is provided', () => {
            let lifecycle = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            assert(lifecycle.confContextData);
        });
        it('should throw exception, if not configuraiton provided', () => {
            try {
                new Lifecycle();
            } catch (e) {
                assert(e instanceof InvalidArgumentException);
            }
            chai.expect(() => new Lifecycle()).to.throw('failed to initialize Lifecycle object, as configuraiont or event processor is not set correctly.');
        });

    });
    describe('# _loadLocalObj()', () => {
        it('should return appLifecycle, if <amsdk.lifecye.local> exist in local storage', () => {

            //stub wx.getStorageSync()
            let WxStub = sinon.stub(wx, 'getStorageSync');
            WxStub.withArgs('amsdk.lifecye.local').returns(DEFAULT_LOCAL_OBJ);

            let lifecycle = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            let rtnValue = lifecycle._loadLocalObj();
            //console.log(JSON.stringify(rtnValue));
            assert.equal(rtnValue.install['app.version'], '1.0.0');
            assert.equal(rtnValue.launches, 100);

            //restore stub
            WxStub.restore();
        });
        it('should return default appLifecycle, if <amsdk.lifecye.local> not exist in local storage', () => {
            let WxStub = sinon.stub(wx, 'getStorageSync');
            WxStub.withArgs('amsdk.lifecye.local').returns(null);

            let lifecycle = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            let rtnValue = lifecycle._loadLocalObj();
            assert.deepEqual(rtnValue, {
                'install': {},
                'upgrade': {},
                'session.previous': {},
                'session.current': {},
                'latest.engaged.day': null,
                'latest.engaged.month': null,
                'launches': 0
            });

            WxStub.restore();
        });
    });
    describe('# _saveObjToLocal()', () => {
        it('should save obj to local with key = <amsdk.lifecye.local>', () => {
            let WxSpy = sinon.spy(wx, 'setStorageSync');

            new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR)._saveObjToLocal();
            assert(WxSpy.withArgs('amsdk.lifecye.local').calledOnce);

            WxSpy.restore();
        });
    });
    describe('# _dateString()', () => {
        it('should return right date format, like [5/15/2019]', () => {
            let lifecycle = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            chai.assert.match(lifecycle._dateString(Date.now()), /^([1-9]|1[0-2])\/([1-9]|[1-2][0-9]|3[0-1])\/[1-9]\d{3}$/);
        });
    });
    describe('# _daysInterval()', () => {
        it('should pass happy path', () => {
            let lifecycle = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            assert.equal(lifecycle._daysInterval(new Date('December 7, 2019 03:24:00').getTime(), new Date('December 17, 2019 03:24:00').getTime()), 10);
        });
        it('should return 0, if the dates are the same day', () => {
            let lifecycle = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            assert.equal(lifecycle._daysInterval(new Date('December 17, 2019 02:24:00').getTime(), new Date('December 17, 2019 03:24:00').getTime()), 0);
        });
    });

    describe('# process()', () => {
        it('should update configuration, if receive a configuration event', () => {
            let newConfig = {
                name: 'amsdk.configuration',
                contextdata: {
                    'app.version': '1.2.0',
                    'session.timeout': 5
                }
            };

            let lifecycle = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            assert.equal(lifecycle.confContextData, DEFAULT_CONFIGURATION.data.contextdata);

            lifecycle.process(newConfig);
            assert.equal(lifecycle.confContextData, newConfig.contextdata);
        });
        it('should pass, when processing first launch after installation', () => {
            let now = new Date('December 7, 2019 03:24:00').getTime();
            let WxStub = sinon.stub(wx, 'getStorageSync');
            WxStub.withArgs('amsdk.lifecye.local').returns(null);

            let lifecycle = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            let launchAppTypeSpy = sinon.spy(lifecycle, '_launchAppType');

            lifecycle.process({
                name: 'amsdk.app.on.launch',
                date: now
            });
            chai.expect(launchAppTypeSpy.returnValues[0]).to.equal(1001);
            assert.equal(lifecycle.contextdata['a.InstallEvent'], 'InstallEvent');
            assert.equal(lifecycle.contextdata['a.InstallDate'], '12/7/2019');

            launchAppTypeSpy.restore();

            let showAppTypeSpy = sinon.spy(lifecycle, '_showAppType');
            let analyticsSpy = sinon.spy(EVENT_PROCESSOR, 'process');

            lifecycle.process({
                name: 'amsdk.app.on.show',
                date: now
            });
            chai.expect(showAppTypeSpy.returnValues[0]).to.equal(2001);
            const expectEvent = {
                "name": "amsdk.lifecycle",
                data: {
                    'action': 'Lifecycle',
                    'isInternalAction': true,
                    'contextdata': {
                        'a.InstallEvent': 'InstallEvent',
                        'a.InstallDate': '12/7/2019',
                        'a.LaunchEvent': 'LaunchEvent',
                        //'a.PrevSessionLength': 0,
                        'a.sessionStartTimestamp': now,
                        'a.Launches': 1,
                        'a.DaysSinceFirstUse': 0,
                        'a.DaysSinceLastUse': 0,
                        'a.DailyEngUserEvent': 'DailyEngUserEvent',
                        'a.MonthlyEngUserEvent': 'MonthlyEngUserEvent',
                        'a.HourOfDay': 3,
                        'a.DayOfWeek': 7
                    }
                }
            };
            assert.deepEqual(analyticsSpy.args[0][0], expectEvent);
            assert.deepEqual(lifecycle.contextdata, {});

            showAppTypeSpy.restore();
            analyticsSpy.restore();
            WxStub.restore();
        });
        it('should pass, when processing second launch as a new session after installation', () => {
            let firstLaunchDate = new Date('December 7, 2019 03:24:00').getTime();
            let hideDate = new Date('December 7, 2019 03:25:00').getTime();
            let lifecycle = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            lifecycle.process({
                name: 'amsdk.app.on.launch',
                date: firstLaunchDate
            });
            lifecycle.process({
                name: 'amsdk.app.on.show',
                date: firstLaunchDate
            });

            lifecycle.process({
                name: 'amsdk.app.on.hide',
                date: hideDate
            });
            assert.equal(lifecycle.appLifecycle['session.current']['amsdk.session.end.date'], hideDate);

            let secondLaunchDate = new Date('December 17, 2019 03:24:00').getTime();
            let lifecycle2 = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            let launchAppTypeSpy = sinon.spy(lifecycle2, '_launchAppType');
            lifecycle2.process({
                name: 'amsdk.app.on.launch',
                date: secondLaunchDate
            });
            chai.expect(launchAppTypeSpy.returnValues[0]).to.equal(1003);
            chai.expect(lifecycle2.contextdata).to.not.have.property('a.InstallEvent');
            chai.expect(lifecycle2.contextdata).to.not.have.property('a.InstallDate');
            launchAppTypeSpy.restore();

            let showAppTypeSpy = sinon.spy(lifecycle2, '_showAppType');
            let analyticsSpy = sinon.spy(lifecycle2.eventProcessor, 'process');
            lifecycle2.process({
                name: 'amsdk.app.on.show',
                date: secondLaunchDate
            });
            chai.expect(showAppTypeSpy.returnValues[0]).to.equal(2001);
            const expectEvent = {
                "name": "amsdk.lifecycle",
                data: {
                    'action': 'Lifecycle',
                    'isInternalAction': true,
                    'contextdata': {
                        'a.LaunchEvent': 'LaunchEvent',
                        'a.PrevSessionLength': 60,
                        'a.sessionStartTimestamp': secondLaunchDate,
                        'a.Launches': 2,
                        'a.DaysSinceFirstUse': 10,
                        'a.DaysSinceLastUse': 10,
                        'a.DailyEngUserEvent': 'DailyEngUserEvent',
                        'a.HourOfDay': 3,
                        'a.DayOfWeek': 3
                    }
                }
            };
            assert.deepEqual(analyticsSpy.args[0][0], expectEvent);
            assert.deepEqual(lifecycle2.contextdata, {});

            showAppTypeSpy.restore();
            analyticsSpy.restore();
        });
        it('should pass, when processing second launch event within session', () => {
            let firstLaunchDate = new Date('December 7, 2019 03:24:00').getTime();
            let hideDate = new Date('December 7, 2019 03:25:00').getTime();
            let lifecycle = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            lifecycle.process({
                name: 'amsdk.app.on.launch',
                date: firstLaunchDate
            });
            lifecycle.process({
                name: 'amsdk.app.on.show',
                date: firstLaunchDate
            });
            lifecycle.process({
                name: 'amsdk.app.on.hide',
                date: hideDate
            });

            let five_seconds_after_hide = new Date('December 7, 2019 03:25:05').getTime();
            let showAppTypeSpy = sinon.spy(lifecycle, '_showAppType');
            lifecycle.process({
                name: 'amsdk.app.on.show',
                date: five_seconds_after_hide
            });
            chai.expect(showAppTypeSpy.returnValues[0]).to.equal(2002);
            assert.equal(lifecycle.appLifecycle['session.current']['amsdk.session.start.date'], firstLaunchDate);
            assert.equal(lifecycle.appLifecycle['session.current']['amsdk.session.end.date'], null);
            assert.equal(lifecycle.appLifecycle.launches, 1);
        });
        it('should pass, when processing first upgrade event', () => {
            let firstLaunchDate = new Date('December 7, 2019 03:24:00').getTime();
            let hideDate = new Date('December 7, 2019 03:25:00').getTime();
            let lifecycle1 = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            lifecycle1.process({
                name: 'amsdk.app.on.launch',
                date: firstLaunchDate
            });
            lifecycle1.process({
                name: 'amsdk.app.on.show',
                date: firstLaunchDate
            });
            lifecycle1.process({
                name: 'amsdk.app.on.hide',
                date: hideDate
            });

            let lifecycle2 = new Lifecycle({
                name: 'amsdk.configuration',
                data: {
                    contextdata: {
                        'name': 'amsdk.configuration',
                        'app.version': '1.2.0',
                        'session.timeout': 10
                    }
                }
            }, EVENT_PROCESSOR);
            let launchAppTypeSpy = sinon.spy(lifecycle2, '_launchAppType');

            let upgradeDate = new Date('December 17, 2019 03:24:00').getTime();
            lifecycle2.process({
                name: 'amsdk.app.on.launch',
                date: upgradeDate
            });
            chai.expect(launchAppTypeSpy.returnValues[0]).to.equal(1002);
            launchAppTypeSpy.restore();
            const expectUpgradeData = {
                'a.UpgradeEvent': 'UpgradeEvent',
                'a.DaysSinceLastUpgrade': 10,
                'a.LaunchesSinceUpgrade': 1
            };
            assert.deepEqual(lifecycle2.contextdata, expectUpgradeData);

            let showAppTypeSpy = sinon.spy(lifecycle2, '_showAppType');
            let analyticsSpy = sinon.spy(EVENT_PROCESSOR, 'process');
            lifecycle2.process({
                name: 'amsdk.app.on.show',
                date: upgradeDate
            });
            chai.expect(showAppTypeSpy.returnValues[0]).to.equal(2001);
            const expectEvent = {
                "name": "amsdk.lifecycle",
                data: {
                    'action': 'Lifecycle',
                    'isInternalAction': true,
                    'contextdata': {
                        'a.LaunchEvent': 'LaunchEvent',
                        'a.UpgradeEvent': 'UpgradeEvent',
                        'a.DaysSinceLastUpgrade': 10,
                        'a.LaunchesSinceUpgrade': 1,
                        'a.PrevSessionLength': 60,
                        'a.sessionStartTimestamp': upgradeDate,
                        'a.Launches': 2,
                        'a.DaysSinceFirstUse': 10,
                        'a.DaysSinceLastUse': 10,
                        'a.DailyEngUserEvent': 'DailyEngUserEvent',
                        'a.HourOfDay': 3,
                        'a.DayOfWeek': 3
                    }
                }
            };
            assert.deepEqual(analyticsSpy.args[0][0], expectEvent);
            assert.deepEqual(lifecycle2.contextdata, {});

            showAppTypeSpy.restore();
            analyticsSpy.restore();

        });
        it('should pass, when processing second upgrade event', () => {
            let firstLaunchDate = new Date('December 7, 2019 03:24:00').getTime();
            let hideDate = new Date('December 7, 2019 03:25:00').getTime();
            let lifecycle1 = new Lifecycle(DEFAULT_CONFIGURATION, EVENT_PROCESSOR);
            lifecycle1.process({
                name: 'amsdk.app.on.launch',
                date: firstLaunchDate
            });
            lifecycle1.process({
                name: 'amsdk.app.on.show',
                date: firstLaunchDate
            });
            lifecycle1.process({
                name: 'amsdk.app.on.hide',
                date: hideDate
            });

            let lifecycle2 = new Lifecycle({
                name: 'amsdk.configuration',
                data: {
                    contextdata: {
                        'name': 'amsdk.configuration',
                        'app.version': '1.2.0',
                        'session.timeout': 10
                    }
                }
            }, EVENT_PROCESSOR);
            let upgradeDate = new Date('December 17, 2019 03:24:00').getTime();
            let hideDate2 = new Date('December 17, 2019 03:25:00').getTime();
            lifecycle2.process({
                name: 'amsdk.app.on.launch',
                date: upgradeDate
            });
            lifecycle2.process({
                name: 'amsdk.app.on.show',
                date: upgradeDate
            });
            lifecycle2.process({
                name: 'amsdk.app.on.hide',
                date: hideDate2
            });

            let lifecycle3 = new Lifecycle({
                name: 'amsdk.configuration',
                data: {
                    contextdata: {
                        'name': 'amsdk.configuration',
                        'app.version': '1.3.0',
                        'session.timeout': 10
                    }
                }
            }, EVENT_PROCESSOR);

            let launchAppTypeSpy = sinon.spy(lifecycle3, '_launchAppType');
            let upgradeDate2 = new Date('December 27, 2019 03:24:00').getTime();
            lifecycle3.process({
                name: 'amsdk.app.on.launch',
                date: upgradeDate2
            });
            chai.expect(launchAppTypeSpy.returnValues[0]).to.equal(1002);
            launchAppTypeSpy.restore();
            const expectUpgradeData = {
                'a.UpgradeEvent': 'UpgradeEvent',
                'a.DaysSinceLastUpgrade': 10,
                'a.LaunchesSinceUpgrade': 1
            };
            assert.deepEqual(lifecycle3.contextdata, expectUpgradeData);

            let showAppTypeSpy = sinon.spy(lifecycle3, '_showAppType');
            let analyticsSpy = sinon.spy(lifecycle3.eventProcessor, 'process');
            lifecycle3.process({
                name: 'amsdk.app.on.show',
                date: upgradeDate2
            });
            chai.expect(showAppTypeSpy.returnValues[0]).to.equal(2001);
            const expectEvent = {
                "name": "amsdk.lifecycle",
                data: {
                    'action': 'Lifecycle',
                    'isInternalAction': true,
                    'contextdata': {
                        'a.LaunchEvent': 'LaunchEvent',
                        'a.UpgradeEvent': 'UpgradeEvent',
                        'a.DaysSinceLastUpgrade': 10,
                        'a.LaunchesSinceUpgrade': 1,
                        'a.PrevSessionLength': 60,
                        'a.sessionStartTimestamp': upgradeDate2,
                        'a.Launches': 3,
                        'a.DaysSinceFirstUse': 20,
                        'a.DaysSinceLastUse': 10,
                        'a.DailyEngUserEvent': 'DailyEngUserEvent',
                        'a.HourOfDay': 3,
                        'a.DayOfWeek': 6
                    }
                }
            };
            assert.deepEqual(analyticsSpy.args[0][0], expectEvent);
            assert.deepEqual(lifecycle2.contextdata, {});

            showAppTypeSpy.restore();
            analyticsSpy.restore();
        });

    });

});