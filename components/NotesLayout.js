// components/NotesLayout.js
import { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import NoteList from './NoteList';
import NoteDetail from './NoteDetail';
import NoteEditor from './NoteEditor';

export default function NotesLayout({ notes = [], onSaveNote, onDeleteNote, onNewNote }) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'edit'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Закрываем модальное окно при нажатии ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);
  
  // Обработчик выбора заметки для просмотра
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setViewMode('detail');
    setIsModalOpen(true);
  };
  
  // Обработчик для режима редактирования
  const handleEditNote = (note) => {
    setSelectedNote(note);
    setViewMode('edit');
    setIsModalOpen(true);
  };
  
  // Обработчик для возврата к списку
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setViewMode('list');
      setSelectedNote(null);
    }, 100); // Небольшая задержка для плавности анимации
  };
  
  // Обработчик для создания новой заметки
  const handleNewNote = () => {
    const newNote = onNewNote();
    setSelectedNote(newNote);
    setViewMode('edit');
    setIsModalOpen(true);
  };
  
  // Обработчик для сохранения заметки
  const handleSaveNote = async (updatedNote) => {
    // Автозаполнение названия, если оно пустое
    if (!updatedNote.title.trim() && updatedNote.content.trim()) {
      const title = updatedNote.content.trim().substring(0, 10) + (updatedNote.content.length > 10 ? '...' : '');
      updatedNote.title = title;
    }
    
    const savedNote = await onSaveNote(updatedNote);
    setSelectedNote(savedNote);
    setViewMode('detail');
  };
  
  // Обработчик для удаления заметки
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      await onDeleteNote(noteId);
      if (selectedNote && selectedNote._id === noteId) {
        handleCloseModal();
      }
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Основная панель со списком заметок */}
      <div className="w-full h-full bg-white">
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold">Мои заметки</h1>
          </div>
          <button
            onClick={handleNewNote}
            className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md text-sm flex items-center justify-center"
          >
            <FiPlus className="mr-1" /> Новая заметка
          </button>
        </div>
        
        <NoteList 
          notes={notes} 
          selectedNote={selectedNote}
          onSelectNote={handleSelectNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      </div>
      
      {/* Модальное окно для детального просмотра и редактирования */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Кнопка закрытия модального окна */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 z-10"
              aria-label="Закрыть"
            >
              <FiX size={24} />
            </button>
            
            <div className="flex-1 overflow-y-auto p-4">
              {viewMode === 'detail' && selectedNote && (
                <NoteDetail 
                  note={selectedNote}
                  onBack={handleCloseModal}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              )}
              
              {viewMode === 'edit' && selectedNote && (
                <NoteEditor 
                  note={selectedNote}
                  onSave={handleSaveNote}
                  onCancel={handleCloseModal}
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {!isModalOpen && notes.length === 0 && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-gray-500 p-4">
            <p className="mb-4">У вас пока нет заметок</p>
            <button
              onClick={handleNewNote}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm"
            >
              Создать первую заметку
            </button>
          </div>
        </div>
      )}
    </div>
  );
}