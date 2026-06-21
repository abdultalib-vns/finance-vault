import CryptoJS from "crypto-js";

export function encryptData(text: string, masterKey: string): string {
  return CryptoJS.AES.encrypt(text, masterKey).toString();
}

export function decryptData(ciphertext: string, masterKey: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, masterKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
}

export function hashPin(pin: string): string {
  return CryptoJS.SHA256(pin).toString();
}
