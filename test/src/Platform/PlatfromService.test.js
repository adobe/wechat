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
    localStorageService,
    systemInfoService,
    networkService,
    logService,
    appLifecycleService
} = require("../../../src/Platform/PlatformService");
const LOG = logService;

describe('test PlatformService.js', () => {
    describe('#localStorageService', () => {
        it('should exist', () => {
            assert(typeof localStorageService == 'object');
        });
    });
    describe('#systemInfoService', () => {
        it('should exist', () => {
            assert(typeof systemInfoService == 'object');
        });
        it('should return object with system information', () => {
            let info = systemInfoService.getSystemInfo();
            assert(info["a.OSVersion"]);
            assert(info["a.DeviceName"]);
            assert(info["a.Resolution"]);
            assert(info["a.RunMode"]);
            assert(info["a.PlatformVersion"]);
        });
    });
    describe('#LogService', () => {
        it('should use console object to print logs', () => {
            LOG.ENABLE_DEBUG = true;
            let debugSpy = sinon.spy(console, 'debug');
            LOG.debug('xx');
            assert(debugSpy.calledOnce);
            debugSpy.restore();
            let logSpy = sinon.spy(console, 'log');
            LOG.log('xx');
            assert(logSpy.calledOnce);
            logSpy.restore();
            let warnSpy = sinon.spy(console, 'warn');
            LOG.warn('xx');
            assert(warnSpy.calledOnce);
            warnSpy.restore();
            let infoSpy = sinon.spy(console, 'info');
            LOG.info('xx');
            assert(infoSpy.calledOnce);
            infoSpy.restore();
            let errorSpy = sinon.spy(console, 'error');
            LOG.error('xx');
            assert(errorSpy.calledOnce);
            errorSpy.restore();
        });
        it('should not print debug log, if we set ENABLE_DEBUG = false', () => {
            LOG.ENABLE_DEBUG = false;
            let debugSpy = sinon.spy(console, 'debug');
            LOG.debug('xx');
            assert(!debugSpy.called);
            debugSpy.restore();
        });
    });
    describe('#networkService', () => {
        it('should exist', () => {
            assert(typeof networkService == 'object');
        });
        it('should execute function fail(), if provided url is invalid', () => {
            let WxStub = sinon.stub(wx, 'request');
            WxStub.returns(0);
            let flag = 0;
            networkService.request({
                url: '',
                success: () => {
                    flag = 1;
                },
                fail: () => {
                    flag = -1;
                },
                complete: () => {
                    assert(flag < 0);
                }
            });
            WxStub.restore();
        });
    });
    describe('#logService', () => {
        it('should exist', () => {
            assert(typeof logService == 'object');
        });
    });
    describe('#appLifecycleService', () => {
        it('should exist', () => {
            assert(typeof appLifecycleService == 'object');
        });
        it('should vall wx api', () => {
            let wxOnAppShow = sinon.spy(wx, 'onAppShow');
            appLifecycleService.onAppShow(() => { });
            assert(wxOnAppShow.calledOnce);
            wxOnAppShow.restore();
            let wxOnAppHide = sinon.spy(wx, 'onAppHide');
            appLifecycleService.onAppHide(() => { });
            assert(wxOnAppHide.calledOnce);
            wxOnAppHide.restore();
            let wxOnError = sinon.spy(wx, 'onError');
            appLifecycleService.onError(() => { });
            assert(wxOnError.calledOnce);
            wxOnError.restore();
        });
    });
});