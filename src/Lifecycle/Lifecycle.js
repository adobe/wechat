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
} = require('../Platform/PlatformService');
const {
    InvalidArgumentException
} = require('../Common/InvalidArgumentException');
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
function Lifecycle(confEvent, eventProcessor) {
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

Lifecycle.prototype = Object.create(Object.prototype);
Lifecycle.prototype.constructor = Lifecycle;

Lifecycle.prototype._loadLocalObj = function () {
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

Lifecycle.prototype._processOnLaunchEvent = function (date) {
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
Lifecycle.prototype._launchAppType = function (install, config) {
    if (!install || !install['app.version']) return LAUNCH_TYPE_INSTALL;
    if (config[APP_VERSION] && install['app.version'] != config[APP_VERSION]) return LAUNCH_TYPE_UPGRADE;
    return LAUNCH_TYPE_OTHER;
};

Lifecycle.prototype._daysSinceLastUpgrade = function (upgrade, now) {
    if (!upgrade || !upgrade['last.upgrade.date']) return 0;
    return this._daysInterval(upgrade['last.upgrade.date'], now);
};

Lifecycle.prototype._launchesSinceUpgrade = function (upgrade) {
    if (!upgrade || !upgrade['launches.since.last.upgrade']) return 0;
    return upgrade['launches.since.last.upgrade'];
};

Lifecycle.prototype._sendAnalyticsEvent = function () {
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

Lifecycle.prototype._processOnShowEvent = function (date) {
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

Lifecycle.prototype._processNewSessionEvent = function (date) {
    //
    this.appLifecycle.upgrade['launches.since.last.upgrade']++;
    this.appLifecycle.launches++;
    //
    this.appLifecycle['session.previous'] = this.appLifecycle['session.current'];
    let currentSession = {};
    currentSession['amsdk.session.start.date'] = date;
    this.appLifecycle['session.current'] = currentSession;
    //
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
    //
    this._sendAnalyticsEvent();
};

Lifecycle.prototype._hasEngagedThisMonth = function (now, month) {
    let thisMonth = new Date(now).getMonth() + 1;
    if (!month || (month != thisMonth)) return false;
    return true;
};
Lifecycle.prototype._hasEngagedToday = function (day) {
    let today = this._dateString(Date.now());
    if (!day || (today != day)) return false;
    return true;
};

Lifecycle.prototype._daysSinceFirstUse = function (install, now) {
    if (!install['first.install.date']) return 0;
    return this._daysInterval(install['first.install.date'], now);
};

Lifecycle.prototype._daysSinceLastUse = function (previousSession, now) {
    if (!previousSession['amsdk.session.end.date']) return 0;
    return this._daysInterval(previousSession['amsdk.session.end.date'], now);
};

Lifecycle.prototype._daysInterval = function (from, to) {
    return Math.round((to - from) / (1000 * 60 * 60 * 24));
};
Lifecycle.prototype._sessionLength = function (session) {
    if (!session['amsdk.session.start.date'] || !session['amsdk.session.end.date']) return 0;
    let idleTime = this.appLifecycle['session.current']['amsdk.session.backgound.time'];
    if (!idleTime || idleTime < 0) {
        idleTime = 0;
    }
    return Math.round((session['amsdk.session.end.date'] - session['amsdk.session.start.date'] - idleTime) / 1000);
};

Lifecycle.prototype._showAppType = function (now, lastHide, timeout) {
    if (this.contextdata['a.UpgradeEvent'] === 'UpgradeEvent') {
        return SHOW_TYPE_SESSION_NEW;
    }
    if ((!lastHide) || (Math.round((now - lastHide) / 1000) > timeout)) {
        return SHOW_TYPE_SESSION_NEW;
    }
    return SHOW_TYPE_SESSION_RETAIN;
};

Lifecycle.prototype._updateConfigContextData = function (contextdata) {
    this.confContextData = contextdata;
    LOG.debug('Lifecycle - update configuration = ', contextdata);
};

Lifecycle.prototype.process = function (event) {
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

Lifecycle.prototype._processOnHideEvent = function (date) {
    this.appLifecycle['session.current']['amsdk.session.end.date'] = date;
    LOG.debug('Lifecycle - update appLifecycle object -', this.appLifecycle);
};

Lifecycle.prototype._saveObjToLocal = function () {
    LOG.debug('Lifecycle - save appLifecycle object to local storage -', this.appLifecycle);
    if (this.appLifecycle) localStorageService.set(LOCAL_OBJ_KEY, this.appLifecycle);
};

Lifecycle.prototype._dateString = function (number) {
    let date = new Date(number);
    return (date.getUTCMonth() + 1) + '/' + date.getUTCDate() + '/' + date.getUTCFullYear();
};

module.exports = Lifecycle;