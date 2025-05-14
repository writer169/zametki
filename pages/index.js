import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  
  const { data: notes } = useSWR(session ? '/api/notes' : null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
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
      
      <div className="flex flex-col md:flex-row h-screen bg-gray-100">
        {/* Боковая панель */}
        <div className="w-full md:w-1/3 lg:w-1/4 h-1/2 md:h-full border-b md:border-r border-gray-200 bg-white">
          <div className="p-3 border-b border-gray-200">
            <h1 className="text-lg font-bold">Мои заметки</h1>
            <button
              onClick={handleNewNote}
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md text-sm"
            >
              Новая заметка
            </button>
          </div>
          
          <NoteList
            notes={notes || []}
            selectedNote={selectedNote}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>

        {/* Основная область */}
        <div className="w-full md:w-2/3 lg:w-3/4 h-1/2 md:h-full overflow-y-auto p-4">
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
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold break-words">{selectedNote.title}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditNote}
                      className="flex-1 bg-blue-500 text-white py-1.5 px-3 rounded-md text-sm"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteNote(selectedNote._id)}
                      className="flex-1 bg-red-500 text-white py-1.5 px-3 rounded-md text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                
                {selectedNote.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedNote.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-200 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="prose note-content">
                  {selectedNote.content.split('\n').map((p, i) => (
                    <p key={i} className="mb-3">{p}</p>
                  ))}
                </div>
                
                {selectedNote.updatedAt && (
                  <div className="text-xs text-gray-500">
                    Обновлено: {new Date(selectedNote.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center text-gray-500 mt-10 text-sm">
              Выберите заметку или создайте новую
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}