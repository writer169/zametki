import connectToDatabase from '../../lib/mongodb';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { generateEncryptionKey, hashPassword } from '../../lib/encryption';

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

// Создаем модель, если она еще не существует
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  // Проверяем заголовок безопасности
  const setupToken = process.env.SETUP_TOKEN;
  if (!setupToken) {
    return res.status(500).json({ message: 'SETUP_TOKEN не настроен на сервере' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== setupToken) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  try {
    await connectToDatabase();
    
    // Проверяем, есть ли уже пользователи
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует. Настройка доступна только при первом запуске.' });
    }

    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    // Генерируем соль и ключ шифрования
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Хешируем пароль
    const hashedPassword = hashPassword(password);
    
    // Генерируем ключ шифрования
    const { key: encryptionKey } = generateEncryptionKey(password, salt);

    // Создаем пользователя
    const user = new User({
      email,
      password: hashedPassword,
      salt,
      encryptionKey
    });

    await user.save();
    
    return res.status(201).json({ 
      message: 'Пользователь успешно создан',
      email: user.email
    });
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}