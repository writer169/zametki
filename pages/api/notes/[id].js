import { getSession } from 'next-auth/react';
import connectToDatabase from '../../../lib/mongodb';
import Note from '../../../models/Note';
import { encryptData, decryptData } from '../../../lib/encryption';

export default async function handler(req, res) {
  // Проверяем авторизацию
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  
  // Получаем id заметки из URL
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Не указан ID заметки' });
  }
  
  // Подключаемся к базе данных
  await connectToDatabase();
  
  // Получаем ключ шифрования из сессии
  const encryptionKey = session.user.encryptionKey;
  
  // Общие проверки для всех методов
  try {
    // Находим заметку и проверяем, принадлежит ли она текущему пользователю
    const note = await Note.findOne({ _id: id, userId: session.user.id });
    
    if (!note) {
      return res.status(404).json({ message: 'Заметка не найдена' });
    }
    
    // Обработка запроса в зависимости от метода
    if (req.method === 'GET') {
      // Получаем заметку
      const noteObj = note.toObject();
      
      // Дешифруем содержимое
      noteObj.content = decryptData(noteObj.content, noteObj.iv, encryptionKey);
      
      return res.status(200).json(noteObj);
    } 
    else if (req.method === 'PUT') {
      const { title, content, tags } = req.body;
      
      // Обновляем заголовок и теги
      note.title = title || note.title;
      if (tags) note.tags = tags;
      
      // Если содержимое изменилось, шифруем и обновляем его
      if (content) {
        const { encryptedData, iv } = encryptData(content, encryptionKey);
        note.content = encryptedData;
        note.iv = iv;
      }
      
      // Сохраняем изменения
      await note.save();
      
      // Возвращаем обновленную заметку
      const updatedNote = note.toObject();
      updatedNote.content = content || decryptData(note.content, note.iv, encryptionKey);
      
      return res.status(200).json(updatedNote);
    } 
    else if (req.method === 'DELETE') {
      // Удаляем заметку
      await Note.deleteOne({ _id: id });
      
      return res.status(200).json({ message: 'Заметка успешно удалена' });
    } 
    else {
      // Метод не поддерживается
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Метод ${req.method} не разрешен` });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка при обработке запроса', error: error.message });
  }
}