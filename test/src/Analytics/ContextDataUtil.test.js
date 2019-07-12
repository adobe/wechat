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
const {
    serializeAnalyticsRequest,
    _applyPropertyToObj,
    _isValidDataKey,
    _convertDataMapToObj,
    _stringifyObj
} = require('../../../src/Analytics/ContextDataUtil');

describe('test Analytics/ContextDataUtil.js', () => {
    describe('# serializeAnalyticsRequest()', () => {
        it('should pass, when inputs are null', () => {
            assert.equal("ndh=1", serializeAnalyticsRequest(null, null));
        });
        it('should ignore null key', () => {
            let map = new Map();
            map.set(null, 'val1');
            map.set('val2', 'val2');
            map.set('val3', 'val3');
            assert.equal(serializeAnalyticsRequest(map, null), 'ndh=1&c.&val2=val2&val3=val3&.c');
        });
        it('should pass, when input valid maps', () => {
            let data = new Map();
            data.set('val1', 'val1');
            data.set('val2', 'val2');
            data.set('val3', 'val3');
            let vars = new Map();
            vars.set('k1', 'v1');
            vars.set('k2', 'v2');
            vars.set('k3', 'v3');
            assert.equal(serializeAnalyticsRequest(data, vars), "ndh=1&c.&val1=val1&val2=val2&val3=val3&.c&k1=v1&k2=v2&k3=v3");
        });
        it('should pass, when input contains values like <val3=val3+>', () => {
            let data = new Map();
            data.set('val1', 'val1');
            data.set('val2', 'val2');
            data.set('val3', 'val3+');
            let vars = new Map();
            vars.set('k1', 'v1');
            vars.set('k2', 'v2');
            vars.set('k3', 'v3');
            assert.equal(serializeAnalyticsRequest(data, vars), "ndh=1&c.&val1=val1&val2=val2&val3=val3%2B&.c&k1=v1&k2=v2&k3=v3");
        });
        it('should pass, when input data contains keys like <a.key1>', () => {
            let data = new Map();
            data.set('a.key1', 'val1');
            data.set('a.key2', 'val2');
            data.set('b.key1', 'val1');
            data.set('b.key2', 'val2');
            data.set('key_1', 'val_1');
            assert.equal(serializeAnalyticsRequest(data, null), "ndh=1&c.&a.&key1=val1&key2=val2&.a&b.&key1=val1&key2=val2&.b&key_1=val_1&.c");
        });
        it('should pass, when input data contains keys like <a.b.key1>', () => {
            let data = new Map();
            data.set('a.key1', 'val1');
            data.set('a.key2', 'val2');
            data.set('a.b.key1', 'val1');
            data.set('a.b.key2', 'val2');
            data.set('key_1', 'val_1');
            assert.equal(serializeAnalyticsRequest(data, null), "ndh=1&c.&a.&key1=val1&key2=val2&b.&key1=val1&key2=val2&.b&.a&key_1=val_1&.c");
        });
        it('should pass, when input data contains special keys like <&&skey1>', () => {
            let data = new Map();
            data.set('a.key1', 'val1');
            data.set('a.key2', 'val2');
            data.set('a.b.key1', 'val1');
            data.set('a.b.key2', 'val2');
            data.set('key_1', 'val_1');
            data.set('&&skey1', 'value1');
            let vars = new Map();
            vars.set('k1', 'v1');
            vars.set('k2', 'v2');
            vars.set('k3', 'v3');
            assert.equal(serializeAnalyticsRequest(data, vars), "ndh=1&c.&a.&key1=val1&key2=val2&b.&key1=val1&key2=val2&.b&.a&key_1=val_1&.c&k1=v1&k2=v2&k3=v3&skey1=value1");
        });
    });
    describe('# _isValidDataKey()', () => {
        it('should return true, if key = [aD_01]', () => {
            let key = 'aD_01';
            assert(_isValidDataKey(key));
        });
        it('should return false, if invalid chars exist in the key', () => {
            ['+', '-', '=', '\\', '/', '&', '$', '@', '!', ';', '|', '#', '%', '^', '(', ')', '{', '}', '[', ']', '\"', ':', '<', '>', ',', '?', '~', '`', '*'].forEach(item => {
                assert(!_isValidDataKey('aD_01' + item));
            });
        });
        it('should return true, if key = [a.b1.c_]', () => {
            let key = 'a.b1.c_';
            assert(_isValidDataKey(key));
        });
        it('should return false, if the key start with .', () => {

        });
        it('should return false, if the key end with .', () => {

        });


    });
    describe('# _applyPropertyToObj()', () => {
        it('should return a right object, when input with valid string', () => {
            const obj = {};
            _applyPropertyToObj(['a', 'b', 'c'], obj, 'xxx');
            assert.deepEqual(obj, { a: { b: { c: 'xxx' } } });
        });
    });
    describe('# _stringifyObj()', () => {
        it('should reutrn string, when input obj and key are valid', () => {
            const obj = {
                a: {
                    b: 'abbb',
                    c: 'accc'
                },
                b: 'bbb',
                c: 'ccc'
            };
            assert.equal(_stringifyObj(obj, 'c'), '&c.&a.&b=abbb&c=accc&.a&b=bbb&c=ccc&.c');
        });
        it('should reutrn string, when input obj and key are valid ..', () => {
            const obj = {
                a: {
                    b: 'abbb',
                    c: 'accc'
                },
                b: 'bbb',
                c: 'ccc',
                d: {
                    x: 'dxxx',
                    y: 'dyyy'
                }
            };
            assert.equal(_stringifyObj(obj, 'c'), '&c.&a.&b=abbb&c=accc&.a&b=bbb&c=ccc&d.&x=dxxx&y=dyyy&.d&.c');
        });
        it('should reutrn string, when input obj and key are valid (depth=2)', () => {
            const obj = {
                a: {
                    b: 'abbb',
                    c: 'accc'
                },
                b: 'bbb',
                c: 'ccc',
                d: {
                    x: 'dxxx',
                    y: {
                        a: 'dyaaa',
                        b: 'dybbb'
                    }
                }
            };
            assert.equal(_stringifyObj(obj, 'c'), '&c.&a.&b=abbb&c=accc&.a&b=bbb&c=ccc&d.&x=dxxx&y.&a=dyaaa&b=dybbb&.y&.d&.c');
        });
    });
    describe('# _convertDataMapToObj()', () => {
        it('should return object, if input is valid data map', () => {
            let map = new Map(Object.entries({
                'a.b': 'abbb',
                'a.c': 'accc',
                'b': 'bbb',
                'b': 'bbb',
                'c': 'ccc',
                'd.x': 'dxxx',
                'd.y.a': 'dyaaa',
                'd.y.b': 'dybbb'
            }));

            assert.deepEqual(_convertDataMapToObj(map), {
                a: {
                    b: 'abbb',
                    c: 'accc'
                },
                b: 'bbb',
                c: 'ccc',
                d: {
                    x: 'dxxx',
                    y: {
                        a: 'dyaaa',
                        b: 'dybbb'
                    }
                }
            });
        });
    });
});