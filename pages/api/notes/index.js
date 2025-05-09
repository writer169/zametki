import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '../../../lib/mongodb';
import Note from '../../../models/Note';
import { encryptData, decryptData } from '../../../lib/encryption';

export default async function handler(req, res) {
  // Проверяем авторизацию - используем getServerSession вместо getSession
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  
  // Подключаемся к базе данных
  await connectToDatabase();
  
  // Получаем ключ шифрования из сессии
  const encryptionKey = session.user.encryptionKey;
  
  if (req.method === 'GET') {
    try {
      // Получаем заметки для текущего пользователя
      const notes = await Note.find({ userId: session.user.id })
        .sort({ updatedAt: -1 }); // Сортировка по дате обновления
      
      // Дешифруем заметки перед отправкой клиенту
      const decryptedNotes = notes.map(note => {
        const plainDoc = note.toObject();
        plainDoc.content = decryptData(plainDoc.content, plainDoc.iv, encryptionKey);
        return plainDoc;
      });
      
      return res.status(200).json(decryptedNotes);
    } catch (error) {
      return res.status(500).json({ message: 'Ошибка при получении заметок', error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content, tags = [] } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: 'Укажите заголовок и содержимое заметки' });
      }
      
      // Шифруем содержимое заметки
      const { encryptedData, iv } = encryptData(content, encryptionKey);
      
      // Создаем новую заметку
      const note = new Note({
        title,
        content: encryptedData,
        iv,
        userId: session.user.id,
        tags
      });
      
      // Сохраняем заметку
      await note.save();
      
      // Возвращаем созданную заметку с дешифрованным содержимым
      const savedNote = note.toObject();
      savedNote.content = content; // Возвращаем исходное содержимое
      
      return res.status(201).json(savedNote);
    } catch (error) {
      return res.status(500).json({ message: 'Ошибка при создании заметки', error: error.message });
    }
  } else {
    // Метод не поддерживается
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Метод ${req.method} не разрешен` });
  }
}