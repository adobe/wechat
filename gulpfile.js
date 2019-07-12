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
  watch,
  series,
  src,
  dest
} = require('gulp');
var uglify = require('gulp-uglify');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var del = require('del');
var shell = require('gulp-shell');
var rollup = require('gulp-rollup');
var rename = require("gulp-rename");
var modConcat = require("module-concat");
var version = require('./src/Common/Version');

const sdkVer = version.sdk_version;

const SOURCE = ['./src/*/*.js'];

function mini_sdk() {
  return src(SOURCE).pipe(babel({
    presets: ['es2015']
  })).pipe(concat('mini_sdk.js')).pipe(uglify({
    compress: true,
  })).pipe(dest('dist/'));
}

function rollup_sdk() {
  return src(SOURCE).pipe(rollup({
    allowRealFiles: true,
    input: './src/AdobeSDK.js',
    output: {
      file: 'bundle.js',
      format: 'cjs'
    }
  })).pipe(rename('AdobeSDK.js')).pipe(dest('dist/')).pipe(dest('./DemoApp/lib/adobe/'));
}


function clean() {
  return del('./coverage');
}


function lint() {
  return src(SOURCE).pipe(eslint()).pipe(eslint.format()).pipe(eslint.failAfterError());
}

function test() {
  return src('test/src/**/*.test.js', {
    read: false
  }).pipe(mocha({
    require: 'babel-core/register'
  }));
}

function coverage() {
  return src(SOURCE).pipe(shell('nyc mocha --require babel-core/register ./test/src/**/*.test.js'));
}

function export_sdk_to_sample_app(cb) {
  var outputFile = "./example/lib/adobe/AdobeSDK.js";
  modConcat("./src/AdobeSDK.js", outputFile, function (err, stats) {
    if (err) throw err;
    console.log(stats.files.length + " were combined into " + outputFile);
  });
  cb();
}


function export_sdk(cb) {
  var outputFile = `./dist/AdobeSDK-${sdkVer}.js`;
  modConcat("./src/AdobeSDK.js", outputFile, function (err, stats) {
    if (err) throw err;
    console.log(stats.files.length + " were combined into " + outputFile);
  });
  cb();
}

function watch_sdk() {
  watch('./src/**/*.js', export_sdk_to_sample_app);
}

exports.clean = clean;
exports.lint = lint;
exports.test = test;
exports.coverage = coverage;
exports.export_sdk = export_sdk;
exports.ci = series(clean, lint, test, coverage, export_sdk);
exports.sync_app = export_sdk_to_sample_app;
exports.watch_sdk = watch_sdk;