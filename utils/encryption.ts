const CryptoJS = require("crypto-js");
const key = "NnaUZikKuxPaN7XxsBK+5oWDbOJe2DhMvtI+OZ5mAhc=";

async function decryptData(data: any) {
  // Remove spaces and quotes using regular expressions
  const l = data.replace(/[\s"']/g, "");
  const s = JSON.parse(atob(l));

  const iv = s.iv;
  const value = s.value;

  let k = CryptoJS.AES.decrypt(value, CryptoJS.enc.Base64.parse(key), {
    iv: CryptoJS.enc.Base64.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const d = k.toString(CryptoJS.enc.Utf8);

  return JSON.parse(d);
}

async function encryptData(data: any) {
  data = JSON.stringify(data);
  const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Base64);

  let k = CryptoJS.AES.encrypt(data, CryptoJS.enc.Base64.parse(key), {
    iv: CryptoJS.enc.Base64.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  ``;

  const et = k.toString();

  const ed = {
    iv: iv,
    value: et,
  };

  const encodedData = btoa(JSON.stringify(ed));

  return encodedData;
}

export { decryptData, encryptData };
