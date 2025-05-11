import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';
import { FiPlus, FiSearch, FiRefreshCw, FiChevronLeft, FiEdit, FiFilter, FiX } from 'react-icons/fi';
import { encryptData, decryptData } from '../lib/encryption';
import { notesAPI } from '../utils/api'; // Импортируем notesAPI вместо отдельных функций

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [showTagFilter, setShowTagFilter] = useState(false);
  
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
      const response = await notesAPI.getAll(); // Используем notesAPI.getAll() вместо fetchNotes()
      const fetchedNotes = response.notes || []; // Извлекаем заметки из ответа
      
      // Расшифровываем заметки
      const decryptedNotes = fetchedNotes.map(note => ({
        ...note,
        title: decryptData(note.title, note.iv, session.user.encryptionKey),
        content: note.content ? decryptData(note.content, note.iv, session.user.encryptionKey) : '',
        tags: note.tags ? JSON.parse(decryptData(note.tags, note.tagsIv, session.user.encryptionKey)) : []
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
      const titleEncryption = encryptData(updatedNote.title, session.user.encryptionKey);
      const contentEncryption = encryptData(updatedNote.content, session.user.encryptionKey);
      const tagsEncryption = encryptData(JSON.stringify(updatedNote.tags), session.user.encryptionKey);
      
      const encryptedNote = {
        ...updatedNote,
        title: titleEncryption.encryptedData,
        iv: titleEncryption.iv,
        content: contentEncryption.encryptedData,
        contentIv: contentEncryption.iv,
        tags: tagsEncryption.encryptedData,
        tagsIv: tagsEncryption.iv
      };
      
      let savedNote;
      
      if (updatedNote._id) {
        // Обновляем существующую заметку
        savedNote = await notesAPI.update(updatedNote._id, encryptedNote); // Используем notesAPI.update
      } else {
        // Создаем новую заметку
        savedNote = await notesAPI.create(encryptedNote); // Используем notesAPI.create
      }
      
      // Расшифровываем сохраненную заметку
      const decryptedSavedNote = {
        ...savedNote,
        title: decryptData(savedNote.title, savedNote.iv, session.user.encryptionKey),
        content: savedNote.content ? decryptData(savedNote.content, savedNote.contentIv, session.user.encryptionKey) : '',
        tags: savedNote.tags ? JSON.parse(decryptData(savedNote.tags, savedNote.tagsIv, session.user.encryptionKey)) : []
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
        await notesAPI.delete(noteId); // Используем notesAPI.delete
        
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
  
  // Получаем все уникальные теги из заметок
  const getAllTags = () => {
    const tagsSet = new Set();
    notes.forEach(note => {
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  };
  
  const handleTagClick = (tag) => {
    if (activeTag === tag) {
      setActiveTag('');
    } else {
      setActiveTag(tag);
      setSearchTerm('');
    }
    setShowTagFilter(false);
  };
  
  // Фильтруем заметки по поисковому запросу и активному тегу
  const filteredNotes = notes.filter(note => {
    // Сначала проверяем фильтр по тегу
    if (activeTag && (!note.tags || !note.tags.includes(activeTag))) {
      return false;
    }
    
    // Затем проверяем поисковый запрос
    if (searchTerm.trim() === '') {
      return true;
    }
    
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
  
  const allTags = getAllTags();
  
  return (
    <Layout>
      {/* Мобильный вид */}
      <div className="md:hidden">
        {/* Поиск, фильтр и кнопка создания заметки */}
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
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FiX className="h-4 w-4 text-neutral-400 hover:text-neutral-700" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className={`btn ${activeTag ? 'btn-primary' : 'btn-secondary'} flex-shrink-0 px-2.5`}
            title="Фильтр по тегам"
          >
            <FiFilter className="h-5 w-5" />
            {activeTag && <span className="sr-only">Активен фильтр: {activeTag}</span>}
          </button>
          
          <button
            onClick={handleCreateNote}
            className="btn-primary flex-shrink-0 px-2.5"
            title="Создать новую заметку"
          >
            <FiPlus className="h-5 w-5" />
          </button>
        </div>
        
        {/* Фильтр по тегам (выпадающий) */}
        {showTagFilter && (
          <div className="mb-4 card animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-neutral-800">Фильтр по тегам</h3>
              <button 
                onClick={() => setShowTagFilter(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            {allTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`tag cursor-pointer ${activeTag === tag ? 'bg-primary-600 text-white' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
                {activeTag && (
                  <button
                    onClick={() => setActiveTag('')}
                    className="tag bg-red-100 text-red-800 cursor-pointer"
                  >
                    Сбросить фильтр
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Нет доступных тегов</p>
            )}
          </div>
        )}
        
        {/* Активный фильтр (показывается, если выбран тег и скрыт фильтр) */}
        {activeTag && !showTagFilter && (
          <div className="mb-4 flex items-center">
            <span className="text-sm text-neutral-600 mr-2">Фильтр:</span>
            <span className="tag bg-primary-600 text-white flex items-center">
              {activeTag}
              <button
                onClick={() => setActiveTag('')}
                className="ml-1.5 text-white"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
        )}
        
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
              <p className="text-xs text-neutral-500 mt-1">
                {new Date(selectedNote.updatedAt).toLocaleDateString()} в {new Date(selectedNote.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
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
                <FiEdit className="w-4 h-4 mr-1.5" />
                Редактировать
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
        
        {/* Кнопка возврата в мобильном режиме */}
        {selectedNote && !isEditMode && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => setSelectedNote(null)}
              className="btn-secondary shadow-soft flex items-center"
            >
              <FiChevronLeft className="w-4 h-4 mr-1.5" />
              Назад к списку
            </button>
          </div>
        )}
      </div>
      
      {/* Десктопный вид (сетка с двумя колонками) */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-6">
        {/* Левая колонка - список заметок */}
        <div className="md:col-span-5 lg:col-span-4">
          <div className="sticky top-20">
            <div className="mb-4 flex flex-col space-y-3">
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
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FiX className="h-4 w-4 text-neutral-400 hover:text-neutral-700" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleCreateNote}
                  className="btn-primary flex-shrink-0 px-2.5"
                  title="Создать новую заметку"
                >
                  <FiPlus className="h-5 w-5" />
                </button>
              </div>
              
              {/* Фильтр по тегам (всегда видимый в десктоп) */}
              {allTags.length > 0 && (
                <div className="card">
                  <h3 className="font-medium text-neutral-800 mb-2">Фильтр по тегам</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`tag cursor-pointer ${activeTag === tag ? 'bg-primary-600 text-white' : ''}`}
                      >
                        {tag}
                      </button>
                    ))}
                    {activeTag && (
                      <button
                        onClick={() => setActiveTag('')}
                        className="tag bg-red-100 text-red-800 cursor-pointer"
                      >
                        Сбросить
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <FiRefreshCw className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                <NoteList
                  notes={filteredNotes}
                  selectedNote={selectedNote}
                  onSelectNote={handleSelectNote}
                  onDeleteNote={handleDeleteNote}
                />
              </div>
            )}
          </div>
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
              <div className="mb-6 border-b border-neutral-100 pb-4">
                <h2 className="text-2xl font-semibold text-neutral-800">{selectedNote.title}</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Последнее обновление: {new Date(selectedNote.updatedAt).toLocaleDateString()} в {new Date(selectedNote.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedNote.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="prose text-neutral-700 whitespace-pre-wrap min-h-[200px]">
                {selectedNote.content || <span className="text-neutral-400 italic">Нет содержимого</span>}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleEditNote}
                  className="btn-primary"
                >
                  <FiEdit className="w-4 h-4 mr-1.5" />
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
}