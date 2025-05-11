import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import Head from 'next/head';
import Layout from '../components/Layout';
import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Загружаем заметки с использованием SWR
  const { data: notes, error } = useSWR(
    session ? '/api/notes' : null
  );
  
  // Проверяем авторизацию
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Обработчик для создания новой заметки
  const handleNewNote = () => {
    setSelectedNote({
      title: '',
      content: '',
      tags: []
    });
    setIsEditing(true);
  };
  
  // Обработчик для выбора заметки
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setIsEditing(false);
  };
  
  // Обработчик для редактирования заметки
  const handleEditNote = () => {
    setIsEditing(true);
  };
  
  // Обработчик для сохранения заметки
  const handleSaveNote = async (updatedNote) => {
    try {
      if (updatedNote._id) {
        // Обновление существующей заметки
        const response = await fetch(`/api/notes/${updatedNote._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedNote),
        });
        
        if (!response.ok) throw new Error('Ошибка при обновлении заметки');
        
        const savedNote = await response.json();
        setSelectedNote(savedNote);
        setIsEditing(false);
        
        // Обновляем кэш SWR
        mutate('/api/notes');
      } else {
        // Создание новой заметки
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedNote),
        });
        
        if (!response.ok) throw new Error('Ошибка при создании заметки');
        
        const savedNote = await response.json();
        setSelectedNote(savedNote);
        setIsEditing(false);
        
        // Обновляем кэш SWR
        mutate('/api/notes');
      }
    } catch (error) {
      console.error('Ошибка при сохранении заметки:', error);
      alert('Не удалось сохранить заметку');
    }
  };
  
  // Обработчик для удаления заметки
  const handleDeleteNote = async (noteId) => {
    if (!confirm('Вы уверены, что хотите удалить эту заметку?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Ошибка при удалении заметки');
      
      // Сбрасываем выбранную заметку, если удаляем ее
      if (selectedNote && selectedNote._id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
      
      // Обновляем кэш SWR
      mutate('/api/notes');
    } catch (error) {
      console.error('Ошибка при удалении заметки:', error);
      alert('Не удалось удалить заметку');
    }
  };
  
  // Показываем состояние загрузки
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Загрузка...</div>
      </div>
    );
  }
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (status === 'unauthenticated') {
    return null; // Перенаправление происходит в useEffect
  }
  
  return (
    <Layout>
      <Head>
        <title>Защищенные заметки</title>
      </Head>
      
      <div className="flex h-screen overflow-hidden bg-gray-100">
        {/* Боковая панель со списком заметок */}
        <div className="w-1/4 h-full overflow-y-auto border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold">Мои заметки</h1>
            <button
              onClick={handleNewNote}
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Новая заметка
            </button>
          </div>
          
          {/* Список заметок */}
          <NoteList
            notes={notes || []}
            selectedNote={selectedNote}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>
        
        {/* Основная область с содержимым заметки */}
        <div className="w-3/4 h-full overflow-y-auto p-6">
          {selectedNote ? (
            isEditing ? (
              <NoteEditor
                note={selectedNote}
                onSave={handleSaveNote}
                onCancel={() => {
                  if (selectedNote._id) {
                    setIsEditing(false);
                  } else {
                    setSelectedNote(null);
                  }
                }}
              />
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                  <div>
                    <button
                      onClick={handleEditNote}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded mr-2"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteNote(selectedNote._id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="mb-4">
                    {selectedNote.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="prose max-w-none">
                  {/* Отображаем содержимое с разбивкой на абзацы */}
                  {selectedNote.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                
                {selectedNote.updatedAt && (
                  <div className="mt-6 text-sm text-gray-500">
                    Обновлено: {new Date(selectedNote.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center text-gray-500 mt-20">
              <p>Выберите заметку или создайте новую</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}