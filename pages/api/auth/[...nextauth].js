import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { hashPassword } from '../../../lib/encryption';
import connectToDatabase from '../../../lib/mongodb';
import mongoose from 'mongoose';

// Определим схему и модель пользователя
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

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Введите email и пароль');
        }

        await connectToDatabase();
        
        // Находим пользователя
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error('Пользователь не найден');
        }
        
        // Проверяем пароль
        const hashedPassword = hashPassword(credentials.password);
        
        if (user.password !== hashedPassword) {
          throw new Error('Неверный пароль');
        }
        
        // Возвращаем данные пользователя
        return {
          id: user._id.toString(),
          email: user.email,
          encryptionKey: user.encryptionKey
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Добавляем encryptionKey в токен после успешной авторизации
      if (user) {
        token.userId = user.id;
        token.encryptionKey = user.encryptionKey;
      }
      return token;
    },
    async session({ session, token }) {
      // Передаем нужные данные в сессию
      session.user.id = token.userId;
      session.user.encryptionKey = token.encryptionKey;
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});

// Регистрационный эндпоинт (используйте только для начального создания пользователя)
export async function registerUser(email, password, encryptionKey, salt) {
  await connectToDatabase();
  
  // Проверяем, существует ли уже пользователь
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }
  
  // Хешируем пароль
  const hashedPassword = hashPassword(password);
  
  // Создаем пользователя
  const user = new User({
    email,
    password: hashedPassword,
    encryptionKey,
    salt
  });
  
  await user.save();
  
  return { id: user._id.toString(), email: user.email };
}