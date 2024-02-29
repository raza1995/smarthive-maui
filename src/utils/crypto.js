import CryptoJS from "crypto-js";

require("dotenv").config();

const cryptoSecretKey = process.env.CRYPTO_SECRET;

// Encrypt
export const EncryptObject = (data) => {
  const encryptString = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    cryptoSecretKey
  ).toString();
  return encryptString;
};

// Decrypt
export const decryptObject = (encryptedString) => {
  const bytes = CryptoJS.AES.decrypt(encryptedString, cryptoSecretKey);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};
