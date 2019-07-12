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

const {
    localStorageService,
    systemInfoService,
    networkService,
    logService
} = require('../Platform/PlatformService');
const Queue = require('../Platform/Queue');
const { serializeAnalyticsRequest } = require('./ContextDataUtil');
const LOG = logService;
const {
    InvalidArgumentException
} = require('../Common/InvalidArgumentException');
const Version = require('../Common/Version');


const EVENT_NAME_LIFECYCLE = 'amsdk.lifecycle';
const EVENT_NAME_ANALYTICS_ACTION = 'amsdk.analytics.action';
const EVENT_NAME_ANALYTICS_STATE = 'amsdk.analytics.state';
const EVENT_NAME_AID = 'amsdk.analytics.aid';
const EVENT_NAME_CONFIGURATION = 'amsdk.configuration';


const LOCAL_AID_KEY = 'adobe.analytics.aid';
const CODE_VERSION = 'wechat-' + Version.sdk_version;


module.exports = class Analytics {
    /**
     * 
     * @param {Object} confEvent 
     * @param {Object} eventProcessor 
     */
    constructor(confEvent, eventProcessor) {
        if (!confEvent || !confEvent.name || !eventProcessor || !confEvent.data || !confEvent.data.contextdata) {
            throw new InvalidArgumentException('fail to initialize Analytics object, as configuraiont or event processor is not set correctly.');
        }
        this.confContextData = confEvent.data.contextdata;
        this.eventProcessor = eventProcessor;
        this.context = {};
        this.queue = new Queue(1);
        this.cachedEvents = [];
        this._loadAid();
        this.taskId = 0;
    }

    _loadAid() {
        if (localStorageService.has(LOCAL_AID_KEY) && localStorageService.get(LOCAL_AID_KEY).length > 0) {
            this.context.aid = localStorageService.get(LOCAL_AID_KEY);
        } else {
            this._getAidFromServer();
        }
    }

    _saveAid(value) {
        this.context.aid = value;
        localStorageService.set(LOCAL_AID_KEY, value);
        const event = {
            "name": EVENT_NAME_AID,
            data: {
                "contextdata": { aid: value }
            }

        };
        LOG.debug('Analytics - send analytics aid, event = ', event);
        this.eventProcessor.process(event);
    }

    _getAidFromServer() {
        const self = this;
        const url = `https://${this.confContextData["analytics.server"]}/id`;
        LOG.debug('Analytics - try to fetch aid from remote, url = ', url);

        this.queue.push((complete) => {
            networkService.request({
                url,
                success: (response) => {
                    if (response.data && response.data.id && response.data.id.length > 0) {
                        LOG.debug('Analytics - get aid from remote, response = ', response);
                        self._saveAid(response.data.id);
                    } else {
                        LOG.debug('Analytics - fail to get aid from remote ( unsupported browser ), response = ', response);
                        self._saveAid(self._generateAid());
                    }
                    complete();
                },
                fail: (error) => {
                    LOG.debug('Analytics - fail to get aid from remote, error = ', error);
                    self._saveAid(self._generateAid());
                    complete();
                }
            });
        }, this.taskId++);
    }

    _generateAid() {
        var s = [];
        var hexDigits = "0123456789ABCDEF";
        var highFirstDigits = "01234567";
        var lowFirstDigits = "0123";
        for (var i = 0; i < 33; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[0] = highFirstDigits.substr(Math.floor(Math.random() * 8), 1);
        s[17] = lowFirstDigits.substr(Math.floor(Math.random() * 4), 1);
        s[16] = "-";

        var uuid = s.join("");
        LOG.debug('Analytics - generate aid from devie, uuid = ', uuid);
        return uuid;
    }

    process(event) {
        if (!this.context.aid) {
            this.cachedEvents.push(event);
            LOG.debug('Analytics - aid is not ready, cache event = ', event);
            return;
        } else if (this.cachedEvents.length == 0) {
            this._process(event);
        } else {
            LOG.debug('Analytics - aid is ready, start to process cached events');
            while (this.cachedEvents.length > 0) {
                let event = this.cachedEvents.shift();
                if (event) this._process(event);
            }
        }
    }

    _process(event) {
        switch (event.name) {
            case EVENT_NAME_CONFIGURATION:
                LOG.debug('Analytics -- update configuration -- event = ', event);
                this.confContextData = event.data.contextdata;
                break;
            case EVENT_NAME_LIFECYCLE:
                this.sessionStartTimestamp = event.data.contextdata['a.sessionStartTimestamp'];
                delete event.data.contextdata['a.sessionStartTimestamp'];
                LOG.debug('Analytics -- track action (lifecycle) -- event = ', event);
                this._trackAction(event);
                break;
            case EVENT_NAME_ANALYTICS_ACTION:
                LOG.debug('Analytics -- track action -- event = ', event);
                this._trackAction(event);
                break;
            case EVENT_NAME_ANALYTICS_STATE:
                LOG.debug('Analytics -- track state -- event = ', event);
                this._trackState(event);
                break;
            default:
                break;
        }
    }

    _trackAction(event) {
        this._track(event.data);
    }

    _trackState(event) {
        this._track(event.data);
    }

    _track(eventData) {
        LOG.debug('Analytics - track, event data = ', eventData);
        let analyticsData = this._assembleAnalyticsData(eventData);
        let analyticsVars = this._assembleAnalyticsVars(eventData);
        let payload = serializeAnalyticsRequest(analyticsData, analyticsVars);
        const url = this._getUrl(this.confContextData);
        LOG.debug(`Analytics - start to send analytics hits to ${url}, with payload = `, payload);

        this.queue.push(complete => {
            networkService.request({
                url,
                method: 'POST',
                data: payload,
                success: (response) => {
                    LOG.debug('Analytics - sucesss to send analytics hit, with response = ', response);
                    complete();
                },
                fail: (error) => {
                    LOG.debug('Analytics - fail to send analytics hit, error = ', error);
                    complete();
                }
            });
        }, this.taskId++);
    }

    _getUrl(config) {
        const cacheBust = Math.floor(Math.random() * Math.floor(100000000));
        return `https://${config["analytics.server"]}/b/ss/${config["analytics.rsids"]}/0/${CODE_VERSION}/s${cacheBust}`;
    }


    static _mergeMaps(map1, map2) {
        return new Map([...map1, ...map2]);
    }

    _getSystemInfoMap() {
        let sysInfo = systemInfoService.getSystemInfo();
        sysInfo["a.AppId"] = this._getAppIdString();
        return new Map(Object.entries(sysInfo));
    }

    _assembleAnalyticsData(eventData) {
        let systemInfoMap = this._getSystemInfoMap();
        LOG.debug('Analytics - get system info = ', systemInfoMap);
        let contextdataMap = new Map(Object.entries(eventData.contextdata || {}));
        let analyticsDataMap = Analytics._mergeMaps(systemInfoMap, contextdataMap);

        if (eventData["action"]) {
            analyticsDataMap.set('a.action', eventData["action"]);
        }

        if (this.sessionStartTimestamp) {
            let secSinceLaunch = Math.round((Date.now() - this.sessionStartTimestamp) / 1000);
            analyticsDataMap.set("a.TimeSinceLaunch", secSinceLaunch);
        }

        return analyticsDataMap;
    }

    _assembleAnalyticsVars(eventData) {
        let analyticsVars = new Map();
        let actionName = eventData["action"];
        let isInternalAction = eventData["isInternalAction"];
        let stateName = eventData["state"];

        if (actionName) {
            analyticsVars.set("pe", "lnk_o");
            analyticsVars.set("pev2", (isInternalAction ? "ADBINTERNAL:" : "AMACTION:") + (actionName || "None"));
        }
        analyticsVars.set("pageName", this._getAppIdString());
        if (stateName) {
            analyticsVars.set("pageName", stateName);
        }

        let analyticsId = this.context.aid;
        if (analyticsId) {
            analyticsVars.set("aid", analyticsId);
        }

        analyticsVars.set("ce", "UTF-8");

        analyticsVars.set("t", this._getTimestampTzOffset());

        if (this.confContextData["analytics.offlineEnabled"]) {
            analyticsVars.set("ts", this._getTimestamp());
        }

        analyticsVars.set("cp", "foreground");
        return analyticsVars;

    }

    _getTimestamp() {
        return Math.round(Date.now() / 1000);
    }

    _getTimestampTzOffset() {
        return `00/00/0000 00:00:00 0 ${new Date().getTimezoneOffset()}`;
    }

    _getAppIdString() {
        let appVersion = this.confContextData['app.version'];
        if (appVersion.length > 0) {
            return this.confContextData['app.id'] + ' (' + appVersion + ')';
        }
        return this.confContextData['app.id'];
    }

};