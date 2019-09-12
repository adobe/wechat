/* This header is placed at the beginning of the output file and defines the
	special `__require`, `__getFilename`, and `__getDirname` functions.
*/
(function () {
	/* __modules is an Array of functions; each function is a module added
		to the project */
    var __modules = {},
        /* __modulesCache is an Array of cached modules, much like
            `require.cache`.  Once a module is executed, it is cached. */
        __modulesCache = {},
        /* __moduleIsCached - an Array of booleans, `true` if module is cached. */
        __moduleIsCached = {};
    /* If the module with the specified `uid` is cached, return it;
        otherwise, execute and cache it first. */
    function __require(uid, parentUid) {
        if (!__moduleIsCached[uid]) {
            // Populate the cache initially with an empty `exports` Object
            __modulesCache[uid] = { "exports": {}, "loaded": false };
            __moduleIsCached[uid] = true;
            if (uid === 0 && typeof require === "function") {
                require.main = __modulesCache[0];
            } else {
                __modulesCache[uid].parent = __modulesCache[parentUid];
            }
            /* Note: if this module requires itself, or if its depenedencies
                require it, they will only see an empty Object for now */
            // Now load the module
            __modules[uid].call(this, __modulesCache[uid], __modulesCache[uid].exports);
            __modulesCache[uid].loaded = true;
        }
        return __modulesCache[uid].exports;
    }
    /* This function is the replacement for all `__filename` references within a
        project file.  The idea is to return the correct `__filename` as if the
        file was not concatenated at all.  Therefore, we should return the
        filename relative to the output file's path.
    
        `path` is the path relative to the output file's path at the time the
        project file was concatenated and added to the output file.
    */
    function __getFilename(path) {
        return require("path").resolve(__dirname + "/" + path);
    }
    /* Same deal as __getFilename.
        `path` is the path relative to the output file's path at the time the
        project file was concatenated and added to the output file.
    */
    function __getDirname(path) {
        return require("path").resolve(__dirname + "/" + path + "/../");
    }
    /********** End of header **********/
    /********** Start module 0: wechat/src/AdobeSDK.js **********/
    __modules[0] = function (module, exports) {
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

        const Lifecycle = __require(1, 0);
        const Analytics = __require(2, 0);
        const EventProcessor = __require(3, 0);
        const {
            registerAppEvent
        } = __require(4, 0);
        const {
            logService
        } = __require(5, 0);
        const {
            InvalidArgumentException
        } = __require(6, 0);
        const LOG = logService;


        const EVENT_NAME_APP_ON_LAUNCH = 'amsdk.app.on.launch';
        const EVENT_NAME_CONFIGURATION = 'amsdk.configuration';

        const DEFAULT_CONFIGURATION_OBJ = {
            name: EVENT_NAME_CONFIGURATION,
            data: {
                contextdata: {
                    "analytics.offlineEnabled": false,
                    "app.version": "",
                    "session.timeout": 30
                }
            }
        };

        /**
         * 
         * @param {Object} conf 
         */
        function _applyDefaultConfSettings(conf) {
            let copy = Object.assign({}, DEFAULT_CONFIGURATION_OBJ.data.contextdata);
            return Object.assign(copy, conf);
        }

        /**
         * 
         * @param {Object} config 
         */
        function _verifyConfig(config) {
            if (!config) return false;
            if (!config['analytics.server']) return false;
            if (!config['analytics.rsids']) return false;
            if (!config['app.id']) return false;
            return true;
        }

        class AMSDK {
            constructor() {
                this.eventProcessor = new EventProcessor();
            }
            /**
             * 
             * @param {Object} conf 
             * {
             * "analytics.server": "test.sc.adobedc.cn",
             * "analytics.rsids": "mobile5wechat.explore",
             * "app.id": "adobe-demo",
             * "app.version": "1.0.0",
             * "analytics.offlineEnabled": true,
             * "session.timeout": 10
             * }
             */
            init(config) {
                if (this.started) {
                    LOG.error('AdobeSDK - you can not initialize AdobeSDK more than once ');
                    return;
                }
                if (!_verifyConfig(config)) {
                    LOG.error('AdobeSDK - not initialize AdobeSDK correctly, config = ', config);
                    throw new InvalidArgumentException('invalid configuration');
                }
                LOG.debug('AdobeSDK - init, config = ', config);
                let mergedConf = _applyDefaultConfSettings(config);
                LOG.debug('AdobeSDK - merge configuration with default value = ', mergedConf);

                let confEvent = {
                    name: EVENT_NAME_CONFIGURATION,
                    data: {
                        contextdata: mergedConf
                    }
                };
                const lifecycle = new Lifecycle(confEvent, this.eventProcessor);
                const analytics = new Analytics(confEvent, this.eventProcessor);
                this.eventProcessor.registerProcessor(lifecycle);
                this.eventProcessor.registerProcessor(analytics);

                registerAppEvent(lifecycle);
                this.eventProcessor.process({
                    name: EVENT_NAME_APP_ON_LAUNCH,
                    date: Date.now()
                });

                this.started = true;
                LOG.debug('AdobeSDK - launched adobe sdk sucessfullly.');

            }

            setDebugLoggingEnabled(enabled) {
                LOG.ENABLE_DEBUG = enabled || false;
            }

            trackAction(action, event) {
                if (!this.started) {
                    LOG.error('AdobeSDK - not initialize AdobeSDK correctly, IGNORE curretion operation - track action with args = ', action, event);
                    return;
                }
                LOG.debug('Analytics - track action , event =', event);
                this.eventProcessor.process({
                    name: 'amsdk.analytics.action',
                    data: {
                        action: action,
                        contextdata: event
                    }
                });
            }

            trackState(state, event) {
                if (!this.started) {
                    LOG.error('AdobeSDK - not initialize AdobeSDK correctly, IGNORE curretion operation - track state with args = ', state, event);
                    return;
                }
                LOG.debug('Analytics - track state , event =', event);
                this.eventProcessor.process({
                    name: 'amsdk.analytics.state',
                    data: {
                        state: state,
                        contextdata: event
                    }
                });
            }
        }

        /**
         *  Adobe SDK for WeChat Mini Program - v1.0.0
         */

        class AdobeSDK {
            constructor() {
                this.amsdk = new AMSDK();
            }

            init(config) {
                try {
                    this.amsdk.init(config);
                } catch (e) {
                    LOG.error(e.stack);
                    if (this.debugMode) throw e;
                }
            }

            trackState(state, event) {
                try {
                    this.amsdk.trackState(state, event);
                } catch (e) {
                    LOG.error(e.stack);
                    if (this.debugMode) throw e;
                }
            }

            trackAction(action, event) {
                try {
                    this.amsdk.trackAction(action, event);
                } catch (e) {
                    LOG.error(e.stack);
                    if (this.debugMode) throw e;
                }
            }

            setDebugModeEnabled(enabled) {
                this.debugMode = enabled || false;
            }

            setDebugLoggingEnabled(enabled) {
                this.amsdk.setDebugLoggingEnabled(enabled);
            }
        }

        module.exports = new AdobeSDK();
        return module.exports;
    }
    /********** End of module 0: wechat/src/AdobeSDK.js **********/
    /********** Start module 1: wechat/src/Lifecycle/Lifecycle.js **********/
    __modules[1] = function (module, exports) {
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
            logService
        } = __require(5, 1);
        const {
            InvalidArgumentException
        } = __require(6, 1);
        const LOG = logService;



        const EVENT_NAME_CONFIGURATION = 'amsdk.configuration';
        const EVENT_NAME_LIFECYCLE = 'amsdk.lifecycle';
        const EVENT_NAME_APP_ON_LAUNCH = 'amsdk.app.on.launch';
        const EVENT_NAME_APP_ON_SHOW = 'amsdk.app.on.show';
        const EVENT_NAME_APP_ON_HIDE = 'amsdk.app.on.hide';
        const EVENT_NAME_APP_ON_ERROR = 'amsdk.app.on.error';

        const APP_VERSION = 'app.version';
        const EVENT_KEY_SESSION_TIMEOUT = 'session.timeout';

        const LOCAL_OBJ_KEY = 'amsdk.lifecye.local';

        const LAUNCH_TYPE_INSTALL = 1001;
        const LAUNCH_TYPE_UPGRADE = 1002;
        const LAUNCH_TYPE_OTHER = 1003;

        const SHOW_TYPE_SESSION_NEW = 2001;
        const SHOW_TYPE_SESSION_RETAIN = 2002;

        /**
         * 
         * @param {Object} confEvent  
         * @param {Object} eventProcessor 
         * 
         * ---------------------------------
         * object layout - appLifecycle
         * ---------------------------------
         * {
         *  'install' : {
         *      'first.install.date' : '',
         *      'latest.install.date' : '',
         *      'app.version' : '1.0.0'
         *  },
         *  'upgrade' : {
         *      'last.upgrade.date' : '',
         *      'launches.since.last.upgrade' : 10
         *  },
         *  'session.previous' : {
         *      'amsdk.session.start.date' : '',
         *      'amsdk.session.end.date' : '',
         *      'amsdk.session.backgound.time': 0
         *  },
         *  'session.current' : {
         *      'amsdk.session.start.date' : '',
         *      'amsdk.session.end.date' : '',
         *      'amsdk.session.backgound.time': 0
         *  },
         *  'latest.engaged.day' : '',
         *  'latest.engaged.month' : '',
         *  'launches' : 100
         * }
         * 
         */
        module.exports = class Lifecycle {
            constructor(confEvent, eventProcessor) {
                LOG.debug('Lifecycle - init -- configuration = ', confEvent);
                if (!confEvent || !eventProcessor) {
                    throw new InvalidArgumentException('failed to initialize Lifecycle object, as configuraiont or event processor is not set correctly.');
                }
                if (!confEvent.name || !confEvent.data || !confEvent.data.contextdata || !confEvent.data.contextdata['app.version'] || !confEvent.data.contextdata['session.timeout']) {
                    throw new InvalidArgumentException('failed to initialize Lifecycle object, configuration event error : ' + JSON.stringify(confEvent));
                }
                this.eventProcessor = eventProcessor;
                this.confContextData = confEvent.data.contextdata;
                this.contextdata = {};
                this.appLifecycle = this._loadLocalObj();
            };
            _loadLocalObj() {
                if (localStorageService.has(LOCAL_OBJ_KEY)) {
                    const local_obj = localStorageService.get(LOCAL_OBJ_KEY);
                    LOG.debug('Lifecycle - load object [appLifecycle] from local storage, key = ' + LOCAL_OBJ_KEY + ' value = ', local_obj);
                    return local_obj;
                }
                LOG.debug('Lifecycle - object [appLifecycle] does not exist in local storage, return default value.');
                return {
                    'install': {},
                    'upgrade': {},
                    'session.previous': {},
                    'session.current': {},
                    'latest.engaged.day': null,
                    'latest.engaged.month': null,
                    'launches': 0
                };
            };
            _processOnLaunchEvent(date) {
                let launchType = this._launchAppType(this.appLifecycle.install, this.confContextData);
                switch (launchType) {
                    case LAUNCH_TYPE_INSTALL:
                        LOG.debug('Lifecycle - process install event.');
                        this.appLifecycle.install = {
                            'first.install.date': date,
                            'latest.install.date': date,
                            'app.version': this.confContextData[APP_VERSION]
                        };
                        this.appLifecycle.upgrade = {
                            'last.upgrade.date': date,
                            'launches.since.last.upgrade': 0
                        };
                        LOG.debug('Lifecycle - update appLifecycle object -', this.appLifecycle);
                        this.contextdata['a.InstallEvent'] = 'InstallEvent';
                        this.contextdata['a.InstallDate'] = this._dateString(date);
                        LOG.debug('Lifecycle - update contextdata of lifecycle event - ', this.contextdata);
                        break;
                    case LAUNCH_TYPE_UPGRADE:
                        LOG.debug('Lifecycle - process upgrade event.');
                        this.appLifecycle.install['latest.install.date'] = date;
                        this.appLifecycle.install['app.version'] = this.confContextData[APP_VERSION];

                        this.contextdata['a.UpgradeEvent'] = 'UpgradeEvent';
                        this.contextdata['a.DaysSinceLastUpgrade'] = this._daysSinceLastUpgrade(this.appLifecycle.upgrade, date);
                        this.contextdata['a.LaunchesSinceUpgrade'] = this._launchesSinceUpgrade(this.appLifecycle.upgrade);
                        LOG.debug('Lifecycle - update contextdata of lifecycle event - ', this.contextdata);

                        this.appLifecycle.upgrade = {};
                        this.appLifecycle.upgrade['last.upgrade.date'] = date;
                        this.appLifecycle.upgrade['launches.since.last.upgrade'] = 0;
                        LOG.debug('Lifecycle - update appLifecycle object -', this.appLifecycle);
                        break;
                    case LAUNCH_TYPE_OTHER:
                        break;
                    default:
                        break;
                }
            };

            /**
             * @param install
             * @param config  
             * @return {number} 
             */
            _launchAppType(install, config) {
                if (!install || !install['app.version']) return LAUNCH_TYPE_INSTALL;
                if (config[APP_VERSION] && install['app.version'] != config[APP_VERSION]) return LAUNCH_TYPE_UPGRADE;
                return LAUNCH_TYPE_OTHER;
            };

            _daysSinceLastUpgrade(upgrade, now) {
                if (!upgrade || !upgrade['last.upgrade.date']) return 0;
                return this._daysInterval(upgrade['last.upgrade.date'], now);
            };

            _launchesSinceUpgrade(upgrade) {
                if (!upgrade || !upgrade['launches.since.last.upgrade']) return 0;
                return upgrade['launches.since.last.upgrade'];
            };

            _sendAnalyticsEvent() {
                const event = {
                    "name": EVENT_NAME_LIFECYCLE,
                    data: {
                        "action": "Lifecycle",
                        "isInternalAction": true,
                        "contextdata": this.contextdata
                    }

                };
                LOG.debug('Lifecycle - send analytics request, event = ', event);
                this.eventProcessor.process(event);
                this.contextdata = {};
            };

            _processOnShowEvent(date) {
                let timeout = this.confContextData[EVENT_KEY_SESSION_TIMEOUT];
                let lastEndDate = this.appLifecycle['session.current']['amsdk.session.end.date'];

                let showAppType = this._showAppType(date, lastEndDate, timeout);
                switch (showAppType) {
                    case SHOW_TYPE_SESSION_NEW:
                        this._processNewSessionEvent(date);
                        break;
                    case SHOW_TYPE_SESSION_RETAIN:
                        let lastHide = this.appLifecycle['session.current']['amsdk.session.end.date'];
                        if (!this.appLifecycle['session.current']['amsdk.session.backgound.time']) {
                            this.appLifecycle['session.current']['amsdk.session.backgound.time'] = 0;
                        }
                        if (lastHide) {
                            this.appLifecycle['session.current']['amsdk.session.backgound.time'] += (date - lastHide);
                        }
                        this.appLifecycle['session.current']['amsdk.session.end.date'] = null;
                        LOG.debug('Lifecycle - retain session, update appLifecycle object -', this.appLifecycle);
                        break;
                    default:
                        break;
                }
            };

            _processNewSessionEvent(date) {
                this.appLifecycle.upgrade['launches.since.last.upgrade']++;
                this.appLifecycle.launches++;
                this.appLifecycle['session.previous'] = this.appLifecycle['session.current'];
                let currentSession = {};
                currentSession['amsdk.session.start.date'] = date;
                this.appLifecycle['session.current'] = currentSession;
                this.contextdata['a.LaunchEvent'] = 'LaunchEvent';
                let seesionLength = this._sessionLength(this.appLifecycle['session.previous']);
                if (seesionLength > 0) {
                    this.contextdata['a.PrevSessionLength'] = seesionLength;
                }
                this.contextdata['a.Launches'] = this.appLifecycle.launches;
                this.contextdata['a.DaysSinceFirstUse'] = this._daysSinceFirstUse(this.appLifecycle.install, date);
                this.contextdata['a.DaysSinceLastUse'] = this._daysSinceLastUse(this.appLifecycle['session.previous'], date);
                if (!this._hasEngagedThisMonth(date, this.appLifecycle['latest.engaged.month'])) {
                    this.appLifecycle['latest.engaged.month'] = new Date(date).getMonth() + 1;
                    this.contextdata['a.MonthlyEngUserEvent'] = 'MonthlyEngUserEvent';
                }
                if (!this._hasEngagedToday(this.appLifecycle['latest.engaged.day'])) {
                    this.appLifecycle['latest.engaged.day'] = this._dateString(date);
                    this.contextdata['a.DailyEngUserEvent'] = 'DailyEngUserEvent';
                }
                this.contextdata['a.HourOfDay'] = new Date(date).getHours();
                this.contextdata['a.DayOfWeek'] = new Date(date).getDay() + 1;
                this.contextdata['a.sessionStartTimestamp'] = date;
                LOG.debug('Lifecycle - update appLifecycle object -', this.appLifecycle);
                LOG.debug('Lifecycle - update contextdata of lifecycle event - ', this.contextdata);
                this._sendAnalyticsEvent();
            };

            _hasEngagedThisMonth(now, month) {
                let thisMonth = new Date(now).getMonth() + 1;
                if (!month || (month != thisMonth)) return false;
                return true;
            };
            _hasEngagedToday(day) {
                let today = this._dateString(Date.now());
                if (!day || (today != day)) return false;
                return true;
            };

            _daysSinceFirstUse(install, now) {
                if (!install['first.install.date']) return 0;
                return this._daysInterval(install['first.install.date'], now);
            };

            _daysSinceLastUse(previousSession, now) {
                if (!previousSession['amsdk.session.end.date']) return 0;
                return this._daysInterval(previousSession['amsdk.session.end.date'], now);
            };

            _daysInterval(from, to) {
                return Math.round((to - from) / (1000 * 60 * 60 * 24));
            };
            _sessionLength(session) {
                if (!session['amsdk.session.start.date'] || !session['amsdk.session.end.date']) return 0;
                let idleTime = this.appLifecycle['session.current']['amsdk.session.backgound.time'];
                if (!idleTime || idleTime < 0) {
                    idleTime = 0;
                }
                return Math.round((session['amsdk.session.end.date'] - session['amsdk.session.start.date'] - idleTime) / 1000);
            };

            _showAppType(now, lastHide, timeout) {
                if (this.contextdata['a.UpgradeEvent'] === 'UpgradeEvent') {
                    return SHOW_TYPE_SESSION_NEW;
                }
                if ((!lastHide) || (Math.round((now - lastHide) / 1000) > timeout)) {
                    return SHOW_TYPE_SESSION_NEW;
                }
                return SHOW_TYPE_SESSION_RETAIN;
            };

            _updateConfigContextData(contextdata) {
                this.confContextData = contextdata;
                LOG.debug('Lifecycle - update configuration = ', contextdata);
            };

            process(event) {
                switch (event.name) {
                    case EVENT_NAME_CONFIGURATION:
                        LOG.debug('Lifecycle - processing [amsdk.configuration] event.');
                        this._updateConfigContextData(event.contextdata);
                        break;
                    case EVENT_NAME_APP_ON_LAUNCH:
                        LOG.debug('Lifecycle - processing [amsdk.app.on.launch] event.');
                        this._processOnLaunchEvent(event.date);
                        break;
                    case EVENT_NAME_APP_ON_SHOW:
                        LOG.debug('Lifecycle - processing [amsdk.app.on.show] event.');
                        this._processOnShowEvent(event.date);
                        break;
                    case EVENT_NAME_APP_ON_HIDE:
                        LOG.debug('Lifecycle - processing [amsdk.app.on.hide] event.');
                        this._processOnHideEvent(event.date);
                        break;
                    default:
                        break;
                }
                this._saveObjToLocal();
            };

            _processOnHideEvent(date) {
                this.appLifecycle['session.current']['amsdk.session.end.date'] = date;
                LOG.debug('Lifecycle - update appLifecycle object -', this.appLifecycle);
            };

            _saveObjToLocal() {
                LOG.debug('Lifecycle - save appLifecycle object to local storage -', this.appLifecycle);
                if (this.appLifecycle) localStorageService.set(LOCAL_OBJ_KEY, this.appLifecycle);
            };

            _dateString(number) {
                let date = new Date(number);
                return (date.getUTCMonth() + 1) + '/' + date.getUTCDate() + '/' + date.getUTCFullYear();
            };
        };

        return module.exports;
    }
    /********** End of module 1: wechat/src/Lifecycle/Lifecycle.js **********/
    /********** Start module 2: wechat/src/Analytics/Analytics.js **********/
    __modules[2] = function (module, exports) {
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
        } = __require(5, 2);
        const Queue = __require(7, 2);
        const { serializeAnalyticsRequest } = __require(8, 2);
        const LOG = logService;
        const {
            InvalidArgumentException
        } = __require(6, 2);
        const Version = __require(9, 2);


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
        return module.exports;
    }
    /********** End of module 2: wechat/src/Analytics/Analytics.js **********/
    /********** Start module 3: wechat/src/Common/EventProcessor.js **********/
    __modules[3] = function (module, exports) {
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
            logService
        } = __require(5, 3);
        const LOG = logService;
        module.exports = class EventProcessor {
            constructor() {
                this.processors = [];
            }
            registerProcessor(processor) {
                this.processors.push(processor);
            }
            process(event) {
                if (!event || !event.name) {
                    LOG.debug('EventHut - invalid event = ', event);
                    return;
                }
                this.processors.forEach((processor) => {
                    processor.process(event);
                });
            }
        };

        return module.exports;
    }
    /********** End of module 3: wechat/src/Common/EventProcessor.js **********/
    /********** Start module 4: wechat/src/Lifecycle/AppLifecyceRegister.js **********/
    __modules[4] = function (module, exports) {
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
            appLifecycleService,
            logService
        } = __require(5, 4);
        const LOG = logService;

        const EVENT_NAME_APP_ON_SHOW = 'amsdk.app.on.show';
        const EVENT_NAME_APP_ON_HIDE = 'amsdk.app.on.hide';
        const EVENT_NAME_APP_ON_ERROR = 'amsdk.app.on.error';

        function registerAppEvent(lifecyccleProcessor) {
            LOG.debug('AppLifecycleRegister -  register app onHide action.');
            appLifecycleService.onAppHide(() => {
                lifecyccleProcessor.process({
                    name: EVENT_NAME_APP_ON_HIDE,
                    date: Date.now()
                });
            });
            LOG.debug('AppLifecycleRegister -  register app onShow action.');
            appLifecycleService.onAppShow(option => {
                lifecyccleProcessor.process({
                    name: EVENT_NAME_APP_ON_SHOW,
                    date: Date.now()
                });
            });
        }
        exports.registerAppEvent = registerAppEvent;
        return module.exports;
    }
    /********** End of module 4: wechat/src/Lifecycle/AppLifecyceRegister.js **********/
    /********** Start module 5: wechat/src/Platform/PlatformService.js **********/
    __modules[5] = function (module, exports) {
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


        exports.localStorageService = __require(10, 5);
        exports.systemInfoService = __require(11, 5);
        exports.networkService = __require(12, 5);
        exports.logService = __require(13, 5);
        exports.appLifecycleService = __require(14, 5);
        return module.exports;
    }
    /********** End of module 5: wechat/src/Platform/PlatformService.js **********/
    /********** Start module 6: wechat/src/Common/InvalidArgumentException.js **********/
    __modules[6] = function (module, exports) {
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

        function InvalidArgumentException(message) {
            this.message = message;
            if ("captureStackTrace" in Error)
                Error.captureStackTrace(this, InvalidArgumentException);
            else
                this.stack = (new Error()).stack;
        }
        InvalidArgumentException.prototype = Object.create(Error.prototype);
        InvalidArgumentException.prototype.name = 'InvalidArgumentException';
        InvalidArgumentException.prototype.constructor = InvalidArgumentException;

        module.exports.InvalidArgumentException = InvalidArgumentException;
        return module.exports;
    }
    /********** End of module 6: wechat/src/Common/InvalidArgumentException.js **********/
    /********** Start module 7: wechat/src/Platform/Queue.js **********/
    __modules[7] = function (module, exports) {
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

        const logService = __require(13, 7);
        const LOG = logService;

        module.exports = class Queue {

            /**
             * 
             * @param {Number} concurrency 
             */
            constructor(concurrency = 1) {
                this.concurrency = concurrency;
                this.queue = [];
                this.activeCount = 0;
            }

            /**
             * 
             * @param {Function} task 
             * function task(complete){
             *  //your code .... 
             *  complete();
             * }
             */
            push(task, name) {
                const self = this;
                LOG.debug(`queue size = ${this.queue.length}`);

                let queueableTask = () => {
                    self.activeCount++;
                    LOG.debug(`run task [${name}] --- `);
                    new Promise((resolve) => {
                        try {
                            task(resolve);
                        } catch (e) {
                            LOG.debug(`task [${name}] throw exception - `, e);
                            resolve();
                        }
                    }).then(() => {
                        LOG.debug(`task [${name}] trigger next task`);
                        self.next();
                    });
                };
                this.activeCount < this.concurrency ? queueableTask() : (this.queue.push(queueableTask) && LOG.debug(` catch task [${name}]`));
            }
            next() {
                this.activeCount--;
                this.queue.length > 0 && this.queue.shift()();
                LOG.debug(`queue size = ${this.queue.length}`);
            }
        };
        return module.exports;
    }
    /********** End of module 7: wechat/src/Platform/Queue.js **********/
    /********** Start module 8: wechat/src/Analytics/ContextDataUtil.js **********/
    __modules[8] = function (module, exports) {
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
            logService
        } = __require(5, 8);
        const LOG = logService;
        const NODE_VALUE = '#node_value';

        function mapToURLParameter(map) {
            let kvPairs = [];
            map.forEach((v, k) => {
                if (!_isValidDataKey(k)) {
                    let msg = 'Invalid key :' + k;
                    LOG.error(msg);
                    throw new InvalidDataKeyException(msg);
                }
                kvPairs.push(k + '=' + encodeURIComponent(v));
            });
            return '&' + kvPairs.join('&');
        }

        /**
         * 
         * @param {String} key  ( [.] [0-9] [A-Z] [_] [a-z] ) (not start with [.] or end with [.])
         * @returns {Boolean} True: input string is a valid data key
         */
        function _isValidDataKey(key) {
            const regex_no_dot = /^[0-9A-Za-z_]+$/;
            const regex2_with_dot = /^[0-9A-Za-z_]+\.[0-9A-Za-z_\.]*[0-9A-Za-z_]+$/;
            if (regex_no_dot.test(key) || regex2_with_dot.test(key)) return true;
            return false;
        }

        /**
         * 
         * @param {Map} map { 'key':'value', 'a.key1':'value1' }
         * @returns {Object} { key:'value', a:{ key1:'value1' } }
         */
        function _convertDataMapToObj(map) {
            const obj = {};
            if (map && map instanceof Map) {
                map.forEach((v, k) => {
                    if (!k || !_isValidDataKey(k)) {
                        LOG.error(`invalid data key [${k}]`);
                        return;
                    }
                    if (k.includes('\.')) {
                        let arry = k.split('\.');
                        _applyPropertyToObj(arry, obj, v);
                    } else {
                        obj[k] = {};
                        obj[k][NODE_VALUE] = v;
                    }
                });
            }
            return obj;
        }

        /**
         * 
         * @param {Array} keyList ['a','b','c']
         * @param {Object} obj {}
         * @param {String} value 'xxx'
         * @returns {Object} {a:{b:{c:'xxx'}}}
         */
        function _applyPropertyToObj(keyList, obj, value) {
            let firstItem = keyList.shift();
            if (firstItem) {
                if (!keyList[0]) {
                    if (!obj[firstItem]) {
                        obj[firstItem] = {};
                        obj[firstItem][NODE_VALUE] = value;
                    } else {
                        obj[firstItem][NODE_VALUE] = value;
                    }
                    return;
                } else {
                    if (!obj[firstItem]) obj[firstItem] = {};
                    _applyPropertyToObj(keyList, obj[firstItem], value);
                }
            }
            return;
        }

        /**
         * 
         * @param {*} obj {a:{b:{c:{'#node_value':'xxx'}}}
         * @param {String} mask 'c'
         * @returns {String} '&c.&a.&b.&c=xxx&.b&.a&.c'
         */

        function _stringifyObj(obj, mask) {
            if (!(typeof obj == 'object')) {
                return '';
            }
            let str = '';
            let nodeValue = '';
            if (obj.hasOwnProperty(NODE_VALUE)) {
                nodeValue = '&' + mask + '=' + encodeURIComponent(obj[NODE_VALUE]);
            }
            if (_isLeaf(obj)) {
                return nodeValue;
            }

            Object.keys(obj).forEach(key => {
                if (key != NODE_VALUE)
                    str += _stringifyObj(obj[key], key);
            });

            return nodeValue + '&' + mask + '.' + str + '&.' + mask;
        }
        function _isLeaf(obj) {
            if ((Object.keys(obj).length == 1) && (Object.keys(obj)[0] == NODE_VALUE)) return true;
            return false;
        }


        function serializeAnalyticsRequest(data, vars) {
            let data_map = new Map(data);
            let var_map = new Map(vars);

            let request_string = "ndh=1";

            data_map.delete("");
            data_map.delete("&&");
            data_map.forEach((v, k) => {
                if (k && k.startsWith('&&')) {
                    let key = k.substring(2);
                    if (!_isValidDataKey(key)) {
                        LOG.debug(`invalid data key [${key}]`);
                        data_map.delete(k);
                    } else {
                        data_map.delete(k);
                        var_map.set(key, v);
                    }
                }
            });
            if (data_map.size > 0) {
                let obj = _convertDataMapToObj(data_map);
                request_string += _stringifyObj(obj, 'c');
            }
            if (var_map.size > 0) {
                request_string += mapToURLParameter(var_map);
            }

            return request_string;
        };


        exports.serializeAnalyticsRequest = serializeAnalyticsRequest;
        exports._convertDataMapToObj = _convertDataMapToObj;
        exports._applyPropertyToObj = _applyPropertyToObj;
        exports._stringifyObj = _stringifyObj;
        exports._isValidDataKey = _isValidDataKey;


        return module.exports;
    }
    /********** End of module 8: wechat/src/Analytics/ContextDataUtil.js **********/
    /********** Start module 9: wechat/src/Common/Version.js **********/
    __modules[9] = function (module, exports) {
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
        module.exports.sdk_version = '1.0.0';
        return module.exports;
    }
    /********** End of module 9: wechat/src/Common/Version.js **********/
    /********** Start module 10: wechat/src/Platform/LocalStorageService.js **********/
    __modules[10] = function (module, exports) {
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

        class LocalStorageService {
            constructor() {

            }
            set(key, value) {
                wx.setStorageSync(key, value);
            }
            get(key) {
                return wx.getStorageSync(key);
            }
            has(key) {
                if (wx.getStorageSync(key)) {
                    return true;
                }
                return false;
            }
            removeWhenExist(key) {
                if (this.get(key)) {
                    wx.removeStorageSync(key);
                }
            }
        }
        module.exports = new LocalStorageService();
        return module.exports;
    }
    /********** End of module 10: wechat/src/Platform/LocalStorageService.js **********/
    /********** Start module 11: wechat/src/Platform/SystemInfoService.js **********/
    __modules[11] = function (module, exports) {
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
        return module.exports;
    }
    /********** End of module 11: wechat/src/Platform/SystemInfoService.js **********/
    /********** Start module 12: wechat/src/Platform/NetworkService.js **********/
    __modules[12] = function (module, exports) {
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

        const logService = __require(13, 12);
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
        return module.exports;
    }
    /********** End of module 12: wechat/src/Platform/NetworkService.js **********/
    /********** Start module 13: wechat/src/Platform/LogService.js **********/
    __modules[13] = function (module, exports) {
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

        class LogService {
            constructor() {

            }

            debug() {
                if (this.ENABLE_DEBUG) console.debug('Adobe SDK [DEBUG]-[' + new Date().toLocaleString() + ']', ...arguments);
            }

            log() {
                console.log('Adobe SDK [DEBUG]-[' + new Date().toLocaleString() + ']', ...arguments);
            }

            warn() {
                console.warn('Adobe SDK [DEBUG]-[' + new Date().toLocaleString() + ']', ...arguments);
            }

            info() {
                console.info('Adobe SDK [DEBUG]-[' + new Date().toLocaleString() + ']', ...arguments);
            }

            error() {
                console.error('Adobe SDK [DEBUG]-[' + new Date().toLocaleString() + ']', ...arguments);
            }

        }
        module.exports = new LogService();
        return module.exports;
    }
    /********** End of module 13: wechat/src/Platform/LogService.js **********/
    /********** Start module 14: wechat/src/Platform/AppLifecycleService.js **********/
    __modules[14] = function (module, exports) {
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

        class AppLifecycleService {
            constructor() { }
            onAppShow(fn) {
                wx.onAppShow(fn);
            }
            onAppHide(fn) {
                wx.onAppHide(fn);
            }
            onError(fn) {
                wx.onError(fn);
            }
        }
        module.exports = new AppLifecycleService();
        return module.exports;
    }
    /********** End of module 14: wechat/src/Platform/AppLifecycleService.js **********/
    /********** Footer **********/
    if (typeof module === "object")
        module.exports = __require(0);
    else
        return __require(0);
})();
/********** End of footer **********/
