 ⛔️  DEPRECATED ⛔️ 
 
# Adobe Exprience Platform Wechat Mini Program SDK

**IMPORTANT: End of support for Adobe Experience Platform Mobile SDK for WeChat Mini Programs
Effective March 30, 2022, support for Adobe Experience Platform Mobile SDKs for WeChat Mini Programs is no longer active. While you may continue using our libraries, Adobe no longer plans to update, modify, or provide support for these libraries. Please contact your Adobe CSM for details.**

### Introduction

This `JS Library` is used to integrate Adobe's Experience Cloud solutions to your WeChat Mini Programs. 



### Feature Details:

1. Pass in the configuration, including analytics and app related settings.
2. Send Analytics track action/state call.
3. Collect `lifecycle` data, including Launch/Install/Upgrade events, and previous session length ....
4. Use `aid` to identify a unique user
   1. Retrieve `aid` from remote analytics server at the first app launch. (Android) 
   2. Generate `aid` locally at the first app launch. (iOS)
   3. Store `aid` and Lifecycle related data into local storage.
5. Use a `queue` to guarantee the request are being sent in order, also to avoid occupying multiple HTTP requests quota.
6. Enable or disable debug logging 
7. Enable or disable debug mode.


### Using Mobile SDK in WeChat Mini Program:

1. In the `onLaunch` method of the `App.js`, implement `AdobeSDK.init()` and pass in valid configurations.
2. Enable debug logging if needed.
3. Call `AdobeSDK.trackState()` when switch to a new `Page`, and pass in the page name and any additional context data. Normally, you can implment this in the `onShow` method of the `Page`.
4. Call `AdobeSDK.trackAction()` if you want to track a certain event.


### Public API :

[Git book](https://aep-sdks.gitbook.io/docs/beta/adobe-experience-platform-mini-programs-sdk)

### Development Environment:

#### Development dependencies

+ [GulpJS](https://gulpjs.com)
+ [ESLint](https://eslint.org)
+ [Mocha](https://mochajs.org)
+ [Chai](https://www.chaijs.com)
+ [SinonJS](https://sinonjs.org)
+ [IstanbulJS](https://istanbul.js.org)
+ [IstanbulJS/NYC](https://github.com/istanbuljs/nyc)

If you're using VSCode, here is a list of recommended plugins :

+ jsDoc
+ Code Runner
+ ESLint
+ Gulp Tasks


#### Launch sample app in WeChat IDE 
* Download WeChat mini program IDE from https://developers.weixin.qq.com/miniprogram/en/dev/devtools/devtools.html
* Open the IDE and login
* Import the project from the **example** folder.

### Build Project

To build this project, you need NodeJS and npm: 

- Install dev dependencies

      npm install

- Run tests

      gulp test

- Export `JS Library` to folder `dist`
  
      gulp export_sdk

### Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
