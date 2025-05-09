import CryptoJS from 'crypto-js';

// Функция для шифрования данных
export function encryptData(data, secretKey) {
  if (!data) return { encryptedData: '', iv: '' };
  
  // Создаем случайный вектор инициализации
  const iv = CryptoJS.lib.WordArray.random(16);
  
  // Шифруем данные с использованием AES
  const encrypted = CryptoJS.AES.encrypt(data, secretKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return {
    encryptedData: encrypted.toString(),
    iv: iv.toString(CryptoJS.enc.Hex)
  };
}

// Функция для дешифрования данных
export function decryptData(encryptedData, iv, secretKey) {
  if (!encryptedData || !iv) return '';
  
  // Преобразуем IV из hex-строки обратно в WordArray
  const ivParams = CryptoJS.enc.Hex.parse(iv);
  
  // Дешифруем данные
  const decrypted = CryptoJS.AES.decrypt(encryptedData, secretKey, {
    iv: ivParams,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  // Преобразуем результат в строку
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Функция для получения ключа шифрования из пароля пользователя
// Использует PBKDF2 для усиления безопасности
export function generateEncryptionKey(password, salt = null) {
  // Если соль не предоставлена, создаем новую
  const usedSalt = salt || CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
  
  // Генерируем ключ с использованием PBKDF2
  const key = CryptoJS.PBKDF2(password, usedSalt, {
    keySize: 256/32,
    iterations: 1000
  }).toString();
  
  return { key, salt: usedSalt };
}

// Функция для хэширования пароля (для хранения в базе данных)
export function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}