import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '../../../lib/mongodb';
import Note from '../../../models/Note';
import { encryptData, decryptData } from '../../../lib/encryption';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Не указан ID заметки' });
  }

  await connectToDatabase();

  const encryptionKey = session.user.encryptionKey;

  try {
    const note = await Note.findOne({ _id: id, userId: session.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Заметка не найдена' });
    }

    if (req.method === 'GET') {
      const noteObj = note.toObject();
      noteObj.content = decryptData(noteObj.content, noteObj.iv, encryptionKey);
      return res.status(200).json(noteObj);
    }

    else if (req.method === 'PUT') {
      const { title, content, tags } = req.body;

      if (title) note.title = title;
      if (tags) note.tags = tags;

      if (content) {
        const { encryptedData, iv } = encryptData(content, encryptionKey);
        note.content = encryptedData;
        note.iv = iv;
      }

      await note.save();

      const updatedNote = note.toObject();
      updatedNote.content = content || decryptData(note.content, note.iv, encryptionKey);

      return res.status(200).json(updatedNote);
    }

    else if (req.method === 'DELETE') {
      await Note.deleteOne({ _id: id });
      return res.status(200).json({ message: 'Заметка успешно удалена' });
    }

    else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Метод ${req.method} не разрешен` });
    }

  } catch (error) {
    return res.status(500).json({
      message: 'Ошибка при обработке запроса',
      error: error.message,
    });
  }
}