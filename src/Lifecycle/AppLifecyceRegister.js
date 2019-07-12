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
} = require('../Platform/PlatformService');
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