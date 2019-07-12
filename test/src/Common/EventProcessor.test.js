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
const EventProcessor = require('../../../src/Common/EventProcessor');

describe('test Common/EventProcessor.js', function () {
    describe('# process()', function () {
        it('should dispatch event to all registered processors', function () {
            let processor1 = {
                process: () => {

                }
            };
            let processor2 = {
                process: () => {

                }
            };
            let processor1Spy = sinon.spy(processor1, 'process');
            let processor2Spy = sinon.spy(processor2, 'process');
            let eventProcessor = new EventProcessor();
            eventProcessor.registerProcessor(processor1);
            eventProcessor.registerProcessor(processor2);
            let event = {
                name: 'xxx'
            };
            eventProcessor.process(event);
            assert(processor1Spy.withArgs(event).calledOnce);
            assert(processor2Spy.withArgs(event).calledOnce);

            processor1Spy.restore();
            processor2Spy.restore();
        });
    });

});