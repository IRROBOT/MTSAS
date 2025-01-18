let arr = [];
const crypt = {
  decryptObject(obj, key) {
    let cnt = 0;
    Object.keys(obj).forEach((k) => {
      let m = JSON.parse(this.base64ToString(k));
      const newKey = this.decrypt(m, key);
      let val = JSON.parse(this.base64ToString(obj[k]));
      let value;
      if (arr[cnt++] == "number") value = parseInt(this.decrypt(val, key));
      else value = this.decrypt(val, key);
      Object.defineProperty(obj, newKey, {
        value,
        enumerable: true,
        writable: true,
        configurable: true,
      });
      delete obj[k]; // 删除原来的键值对
    });
    return obj;
  },
  // 将Base64编码的字符串转换为原始字符串
  base64ToString(b64str) {
    // 对Base64编码的字符串进行Base64解码
    let val = window.atob(b64str);
    return window.decodeURIComponent(val);
  },

  decrypt(encryptedText, key) {
    let decryptedText = "";
    for (let i = 0; i < encryptedText.length; i++) {
      let charCode = encryptedText.charCodeAt(i);
      let keyCharCode = key.charCodeAt(i % key.length);
      decryptedText += String.fromCharCode(charCode ^ keyCharCode);
    }
    return decryptedText;
  },
  encryptObject(obj, key) {
    Object.keys(obj).forEach((k) => {
      const newKey = this.encrypt(k, key);
      let type = typeof obj[k];
      arr.push(type.toString());
      let val = "";
      if (obj[k] != null) val = obj[k].toString();
      const value = this.encrypt(val, key);
      Object.defineProperty(obj, newKey, {
        value,
        enumerable: true,
        writable: true,
        configurable: true,
      });
      delete obj[k]; // 删除原来的键值对
    });
    return obj;
  },

  encrypt(text, key) {
    let encryptedText = "";
    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i);
      let keyCharCode = key.charCodeAt(i % key.length);
      encryptedText += String.fromCharCode(charCode ^ keyCharCode);
    }
    return this.stringToBase64(encryptedText);
  },

  // 将原始字符串转换为Base64编码
  stringToBase64(str) {
    // 对非ASCII字符进行URI编码
    return window.btoa(window.encodeURIComponent(JSON.stringify(str)));
  },
};

module.exports = crypt;
