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
const Queue = require("../../../src/Platform/Queue");
const logService = require('../../../src/Platform/LogService');
const LOG = logService;

describe('test Platform/Queue.js', () => {
    describe('#push()', () => {
        before(() => {
            LOG.ENABLE_DEBUG = false;
        });
        it('should run provided task, if active task count < concurrency limit', (done) => {

            let flag = 0;
            let task1 = complete => {
                flag++;
                setTimeout(() => { flag--; complete(); }, 10);
            };
            let task2 = complete => {
                flag += 3;
                setTimeout(() => { assert.equal(flag, 7); flag--; done(); complete(); }, 30);
            };
            let task3 = complete => {
                flag += 5;
                setTimeout(() => { assert.equal(flag, 8); flag--; complete(); }, 10);
            };
            let queue = new Queue(2);
            queue.push(task1, 1);
            queue.push(task2, 2);
            queue.push(task3, 3);
            assert.equal(flag, 4);
        });
        it('should ignore exceptions which throwed from provided task', (done) => {
            let flag = 0;
            let queue = new Queue(2);
            let task1 = complete => {
                flag++;
                setTimeout(() => { assert.equal(flag, 8); flag--; done(); complete(); }, 30);
            };
            let task2 = () => {
                flag += 3;
                throw { msg: 'xxxx' };
            };
            let task3 = complete => {
                flag += 5;
                setTimeout(() => { assert.equal(flag, 9); flag--; complete(); }, 10);
            };
            queue.push(task1, 1);
            queue.push(task2, 2);
            queue.push(task3, 3);
        });
    });
});