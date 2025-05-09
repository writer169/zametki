import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';
import { FiPlus, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { decryptNote, encryptNote } from '../lib/encryption';
import { fetchNotes, createNote, updateNote, deleteNote } from '../utils/api';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Перенаправляем на страницу входа, если пользователь не аутентифицирован
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Загружаем заметки при монтировании компонента
  useEffect(() => {
    if (status === 'authenticated') {
      loadNotes();
    }
  }, [status]);
  
  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await fetchNotes();
      
      // Расшифровываем заметки
      const decryptedNotes = fetchedNotes.map(note => ({
        ...note,
        title: decryptNote(note.title, session.user.encryptionKey),
        content: note.content ? decryptNote(note.content, session.user.encryptionKey) : '',
        tags: note.tags ? JSON.parse(decryptNote(note.tags, session.user.encryptionKey)) : []
      }));
      
      // Сортируем заметки по дате обновления (сначала новые)
      decryptedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      setNotes(decryptedNotes);
    } catch (error) {
      console.error('Ошибка при загрузке заметок:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateNote = () => {
    setSelectedNote({ title: '', content: '', tags: [] });
    setIsEditMode(true);
  };
  
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setIsEditMode(false);
  };
  
  const handleEditNote = () => {
    setIsEditMode(true);
  };
  
  const handleSaveNote = async (updatedNote) => {
    try {
      // Шифруем данные заметки
      const encryptedNote = {
        ...updatedNote,
        title: encryptNote(updatedNote.title, session.user.encryptionKey),
        content: encryptNote(updatedNote.content, session.user.encryptionKey),
        tags: encryptNote(JSON.stringify(updatedNote.tags), session.user.encryptionKey)
      };
      
      let savedNote;
      
      if (updatedNote._id) {
        // Обновляем существующую заметку
        savedNote = await updateNote(updatedNote._id, encryptedNote);
      } else {
        // Создаем новую заметку
        savedNote = await createNote(encryptedNote);
      }
      
      // Расшифровываем сохраненную заметку
      const decryptedSavedNote = {
        ...savedNote,
        title: decryptNote(savedNote.title, session.user.encryptionKey),
        content: savedNote.content ? decryptNote(savedNote.content, session.user.encryptionKey) : '',
        tags: savedNote.tags ? JSON.parse(decryptNote(savedNote.tags, session.user.encryptionKey)) : []
      };
      
      // Обновляем список заметок
      if (updatedNote._id) {
        setNotes(notes.map(note => 
          note._id === decryptedSavedNote._id ? decryptedSavedNote : note
        ));
      } else {
        setNotes([decryptedSavedNote, ...notes]);
      }
      
      setSelectedNote(decryptedSavedNote);
      setIsEditMode(false);
    } catch (error) {
      console.error('Ошибка при сохранении заметки:', error);
      alert('Не удалось сохранить заметку. Пожалуйста, попробуйте еще раз.');
    }
  };
  
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      try {
        await deleteNote(noteId);
        
        // Обновляем список заметок
        const updatedNotes = notes.filter(note => note._id !== noteId);
        setNotes(updatedNotes);
        
        // Если была выбрана удаленная заметка, сбрасываем выбор
        if (selectedNote && selectedNote._id === noteId) {
          setSelectedNote(null);
          setIsEditMode(false);
        }
      } catch (error) {
        console.error('Ошибка при удалении заметки:', error);
        alert('Не удалось удалить заметку. Пожалуйста, попробуйте еще раз.');
      }
    }
  };
  
  const handleCancelEdit = () => {
    if (selectedNote && !selectedNote._id) {
      // Если это была новая заметка, убираем выбор
      setSelectedNote(null);
    }
    setIsEditMode(false);
  };
  
  // Фильтруем заметки по поисковому запросу
  const filteredNotes = searchTerm.trim() === ''
    ? notes
    : notes.filter(note => {
        const searchLower = searchTerm.toLowerCase();
        return (
          note.title.toLowerCase().includes(searchLower) ||
          (note.content && note.content.toLowerCase().includes(searchLower)) ||
          note.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });
  
  // Если пользователь загружается, показываем загрузку
  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <FiRefreshCw className="w-10 h-10 mx-auto text-primary-500 animate-spin" />
            <p className="mt-4 text-neutral-600">Загрузка...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {/* Мобильный вид */}
      <div className="md:hidden">
        {/* Поиск и кнопка создания заметки */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Поиск заметок..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          <button
            onClick={handleCreateNote}
            className="btn-primary flex-shrink-0"
          >
            <FiPlus className="h-5 w-5" />
          </button>
        </div>
        
        {/* Режим редактирования на мобильных */}
        {isEditMode && selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onCancel={handleCancelEdit}
          />
        ) : selectedNote ? (
          <div className="card animate-fade-in">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">{selectedNote.title}</h2>
              
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedNote.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="prose text-neutral-700 mt-4 whitespace-pre-wrap">
              {selectedNote.content || <span className="text-neutral-400 italic">Нет содержимого</span>}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleEditNote}
                className="btn-primary"
              >
                Редактировать
              </button>
            </div>
          </div>
        ) : (
          <NoteList
            notes={filteredNotes}
            selectedNote={selectedNote}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
        
        {/* Кнопка возврата в мобильном режиме */}
        {selectedNote && !isEditMode && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => setSelectedNote(null)}
              className="btn-secondary shadow-soft"
            >
              Назад к списку
            </button>
          </div>
        )}
      </div>
      
      {/* Десктопный вид (сетка с двумя колонками) */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-6">
        {/* Левая колонка - список заметок */}
        <div className="md:col-span-5 lg:col-span-4">
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск заметок..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-9"
                />
              </div>
              <button
                onClick={handleCreateNote}
                className="btn-primary flex-shrink-0"
                title="Создать новую заметку"
              >
                <FiPlus className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <FiRefreshCw className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          ) : (
            <NoteList
              notes={filteredNotes}
              selectedNote={selectedNote}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
            />
          )}
        </div>
        
        {/* Правая колонка - просмотр/редактирование заметки */}
        <div className="md:col-span-7 lg:col-span-8">
          {isEditMode && selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onSave={handleSaveNote}
              onCancel={handleCancelEdit}
            />
          ) : selectedNote ? (
            <div className="card animate-fade-in">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-neutral-800">{selectedNote.title}</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {new Date(selectedNote.updatedAt).toLocaleString()}
                </p>
                
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedNote.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="prose text-neutral-700 mt-6 whitespace-pre-wrap">
                {selectedNote.content || <span className="text-neutral-400 italic">Нет содержимого</span>}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleEditNote}
                  className="btn-primary"
                >
                  Редактировать
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-card text-center p-6">
              <svg className="w-16 h-16 text-neutral-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-neutral-700">Выберите заметку</h3>
              <p className="text-neutral-500 mt-1">Или создайте новую с помощью кнопки "+"</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );