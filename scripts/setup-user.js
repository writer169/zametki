/**
 * Скрипт для создания первого и единственного пользователя
 * Запускайте его только один раз при настройке приложения:
 *   node scripts/setup-user.js
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Загружаем переменные окружения из .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
  console.error('Ошибка: Отсутствует переменная окружения MONGODB_URI');
  process.exit(1);
}

// Определяем схему пользователя
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  encryptionKey: {
    type: String,
    required: true
  }
});

// Подключаемся к MongoDB
async function main() {
  try {
    console.log('Подключение к MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Подключено к MongoDB успешно');

    // Создаем модель пользователя
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Проверяем, есть ли уже пользователи
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Пользователь уже существует. Скрипт предназначен для первичной настройки.');
      process.exit(0);
    }

    // Запрашиваем данные для создания пользователя
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Функция для запроса данных
    const question = (query) => new Promise((resolve) => {
      readline.question(query, resolve);
    });

    const email = await question('Введите email для входа: ');
    const password = await question('Введите пароль: ');
    
    if (!email || !password) {
      console.error('Email и пароль обязательны');
      process.exit(1);
    }

    // Генерируем соль и ключ шифрования
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Хешируем пароль с помощью bcrypt
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    // Генерируем ключ шифрования для заметок на основе пароля
    const encryptionKey = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha512').toString('hex');

    // Создаем пользователя
    const user = new User({
      email,
      password: hashedPassword,
      salt,
      encryptionKey
    });

    await user.save();
    console.log(`Пользователь ${email} успешно создан`);
    
    readline.close();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

main();