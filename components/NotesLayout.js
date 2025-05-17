// components/NotesLayout.js
import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import NoteList from './NoteList';
import NoteDetail from './NoteDetail';
import NoteEditor from './NoteEditor';

export default function NotesLayout({ notes = [], onSaveNote, onDeleteNote, onNewNote }) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'edit'
  
  // Обработчик выбора заметки для просмотра
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setViewMode('detail');
  };
  
  // Обработчик для режима редактирования
  const handleEditNote = (note) => {
    setSelectedNote(note);
    setViewMode('edit');
  };
  
  // Обработчик для возврата к списку
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedNote(null);
  };
  
  // Обработчик для создания новой заметки
  const handleNewNote = () => {
    const newNote = onNewNote();
    setSelectedNote(newNote);
    setViewMode('edit');
  };
  
  // Обработчик для сохранения заметки
  const handleSaveNote = async (updatedNote) => {
    const savedNote = await onSaveNote(updatedNote);
    setSelectedNote(savedNote);
    setViewMode('detail');
  };
  
  // Обработчик для удаления заметки
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      await onDeleteNote(noteId);
      if (selectedNote && selectedNote._id === noteId) {
        handleBackToList();
      }
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Боковая панель со списком заметок */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-1/2 md:h-full border-b md:border-r border-gray-200 bg-white">
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
      
      {/* Основная область для просмотра и редактирования */}
      <div className="w-full md:w-2/3 lg:w-3/4 h-1/2 md:h-full overflow-y-auto p-4">
        {viewMode === 'list' && (
          <div className="text-center text-gray-500 mt-10 text-sm">
            Выберите заметку или создайте новую
          </div>
        )}
        
        {viewMode === 'detail' && selectedNote && (
          <NoteDetail 
            note={selectedNote}
            onBack={handleBackToList}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
          />
        )}
        
        {viewMode === 'edit' && selectedNote && (
          <NoteEditor 
            note={selectedNote}
            onSave={handleSaveNote}
            onCancel={() => selectedNote._id ? setViewMode('detail') : handleBackToList()}
          />
        )}
      </div>
    </div>
  );
}