// pages/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import NotesLayout from '../components/NotesLayout';
import { notesAPI } from '../utils/api';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка аутентификации и редирект при необходимости
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Загрузка заметок при аутентификации
  useEffect(() => {
    if (session) {
      loadNotes();
    }
  }, [session]);

  // Функция загрузки заметок
  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const data = await notesAPI.getAll();
      setNotes(data || []);
    } catch (error) {
      console.error('Ошибка при загрузке заметок:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик сохранения/обновления заметки
  const handleSaveNote = async (note) => {
    try {
      let savedNote;
      
      if (note._id) {
        // Обновление существующей заметки
        savedNote = await notesAPI.update(note._id, note);
      } else {
        // Создание новой заметки
        savedNote = await notesAPI.create(note);
      }
      
      // Обновляем список заметок
      setNotes(prevNotes => {
        if (note._id) {
          // Заменяем существующую заметку
          return prevNotes.map(n => n._id === note._id ? savedNote : n);
        } else {
          // Добавляем новую заметку в начало списка
          return [savedNote, ...prevNotes];
        }
      });
      
      return savedNote;
    } catch (error) {
      console.error('Ошибка при сохранении заметки:', error);
      alert('Не удалось сохранить заметку. Попробуйте еще раз.');
      throw error;
    }
  };

  // Обработчик удаления заметки
  const handleDeleteNote = async (noteId) => {
    try {
      await notesAPI.delete(noteId);
      // Удаляем заметку из списка
      setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Ошибка при удалении заметки:', error);
      alert('Не удалось удалить заметку. Попробуйте еще раз.');
      throw error;
    }
  };

  // Отображаем состояние загрузки
  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 text-gray-500">Загрузка...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Создание новой заметки
  const handleCreateNewNote = () => {
    const newEmptyNote = {
      title: '',
      content: '',
      tags: []
    };
    return newEmptyNote;
  };

  return (
    <Layout>
      <Head>
        <title>Защищенные заметки</title>
      </Head>
      
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Кнопка для создания новой заметки появляется внутри NotesLayout */}
        <NotesLayout 
          notes={notes} 
          onSaveNote={handleSaveNote} 
          onDeleteNote={handleDeleteNote}
          onNewNote={handleCreateNewNote}
        />
      </div>
    </Layout>
  );
}