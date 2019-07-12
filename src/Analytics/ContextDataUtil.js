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
} = require('../Platform/PlatformService');
const LOG = logService;

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
                obj[k] = v;
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
            obj[firstItem] = value;
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
 * @param {*} obj {a:{b:{c:'xxx'}}}
 * @param {String} mask 'c'
 * @returns {String} '&c.&a.&b.&c=xxx&.b&.a&.c'
 */

function _stringifyObj(obj, mask) {
    let str = '';
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] == 'object') {
            str += _stringifyObj(obj[key], key);
        } else {
            str = str + '&' + key + '=' + encodeURIComponent(obj[key]);
        }
    });
    return '&' + mask + '.' + str + '&.' + mask;
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

