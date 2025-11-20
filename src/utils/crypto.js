import CryptoJS from 'crypto-js';

// 与后端相同的密钥和IV
const secretKey = '1angvv7ChLoveYwq';
const iv = '1234567890123456';

export default {
  // 与后端匹配的AES加密
  encrypt(data) {
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }

    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const ivParam = CryptoJS.enc.Utf8.parse(iv);

    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: ivParam,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      format: CryptoJS.format.Hex // 使用Hex避免OpenSSL格式问题
    });

    return encrypted.toString();
  },

  decrypt(ciphertext) {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const ivParam = CryptoJS.enc.Utf8.parse(iv);

    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: ivParam,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      format: CryptoJS.format.Hex
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
