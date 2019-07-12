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

const logService = require('./LogService');
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