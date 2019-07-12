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
    InvalidDataKeyException
} = require('../../../src/Common/InvalidDataKeyException');
describe('test Common/InvalidDataKeyException.js', () => {
    describe('#  InvalidDataKeyException()', () => {
        it('should be instanceof InvalidDataKeyException', () => {
            let error = new InvalidDataKeyException('this is an error');
            assert(error instanceof InvalidDataKeyException);
        });
        it('should be instanceof Error', () => {
            let error = new InvalidDataKeyException('this is an error');
            assert(error instanceof Error);
        });
        it('should set message correctly', () => {
            let error = new InvalidDataKeyException('this is an error');
            assert.equal(error.message, 'this is an error');
        });
        it('should set name correctly', () => {
            let error = new InvalidDataKeyException('this is an error');
            assert.equal(error.name, 'InvalidDataKeyException');
        });
        it('should set stack correctly', () => {
            let error = new InvalidDataKeyException('this is an error');
            assert(error.stack);
        });
    });
});