// var buffer = require('lib/buffer/index.js').Buffer
// var crypto = require('lib/crypto-js/crypto-js.js').Crypto
var AES = require("lib/crypto-js/aes");
// var SHA256 = require("lib/crypto-js/sha256");
var CryptoJS = require("lib/crypto-js/crypto-js");

function WXBizDataCrypt(appId, sessionKey) {
  this.appId = appId
  this.sessionKey = sessionKey
}
WXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
  // base64 decode
  // var sessionKey = new buffer(this.sessionKey, 'base64')
  // encryptedData = new buffer('q7e71aXhyjKUISTQDxee8BZJksx4TQwD8LtHty27RRQ7k/wPU2hUsiLw1R0/H0h7MFF0Y5LftaRjMNKX6JN5IWoBv/+8AVuRhzGvY0w0oI12XhRznKH47i8PTU7SkcYAdp7Q6mAq3ic6582FmbAbUcMqiyvK+PK7JZYtW+MiEqdzz5BuBiOaD7y+BQBrP4nALtR3Su0TL93vMQnHKQh14faEEyefqs3c+6oMBAX3oVnEx/1lbg/O6Y3iAkgF/1o2vOjqHo4F2CMLnJyDEzUKsteiESSjJeaSVxJUIBdeT0YF9tRo+xWGrwwSd1verCCvWPKlvfcQii14+otOP3opgTgMi26DxqgEWGwWFfp8l9IdiKktya+ckbJ3p4k7iHp//UIEXKNHEp9NlbskBv8GBQ8LunV2r6X62AKGTzRYxKShvSOKELatGd/70LPoqGognp4ylQdxeocOCn6dXG3lsgtfn3LBtDRVBUqSdXUh/ic=', 'base64')
  // iv = new buffer('+yt+xp+5qGnRyNtUjiPZUA==', 'base64')

  try {
    //  解密
    // var decipher = new crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
    // console.log("decipher value" + decipher)
    // // 设置自动 padding 为 true，删除填充补位
    // decipher.setAutoPadding(true)
    // var decoded = decipher.update(encryptedData, 'binary', 'utf8')
    // decoded += decipher.final('utf8')

    var b64_sessionKey = CryptoJS.enc.Base64.parse(this.sessionKey);
    var b64_encryptedData = CryptoJS.enc.Base64.parse(encryptedData);
    var b64_iv = CryptoJS.enc.Base64.parse(iv);

    var bytes = CryptoJS.AES.decrypt(b64_encryptedData, b64_sessionKey, {
        iv: b64_iv,
        mode: CryptoJS.mode.CBC,
    });
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    //var plaintext = bytes.toString('ascii');
    console.log({
        plaintext
    });

  } catch (err) {
    throw new Error('Illegal Buffer')
  }

  // if (decoded.watermark.appid !== this.appId) {
  //   throw new Error('Illegal Buffer')
  // }

  return plaintext
}

module.exports = WXBizDataCrypt