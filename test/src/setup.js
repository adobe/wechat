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

global.wx = {
    onAppShow() { },
    onAppHide() { },
    onError() { },
    onLaunch() { },
    setStorageSync(key, value) {
        this.map.set(key, value);
    },
    getStorageSync(key) {
        return this.map.get(key);
    },
    removeStorageSync(key) {
        this.map.delete(key);
    },
    getSystemInfoSync() {
        return {
            system: 'ios 10.12',
            model: 'iphone xr',
            windowHeight: 800,
            windowWidth: 600,
            version: '1.5.0'
        };
    },
    request(obj) {

    },
    map: new Map()

};