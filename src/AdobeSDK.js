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

const Lifecycle = require('./Lifecycle/Lifecycle');
const Analytics = require('./Analytics/Analytics');
const EventProcessor = require('./Common/EventProcessor');
const {
  registerAppEvent
} = require('./Lifecycle/AppLifecyceRegister');
const {
  logService
} = require('./Platform/PlatformService');
const {
  InvalidArgumentException
} = require('./Common/InvalidArgumentException');
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