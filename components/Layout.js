// components/Layout.js
import { useState } from 'react';
import NoteList from './NoteList';
import NoteDetail from './NoteDetail';
import NoteEditor from './NoteEditor';

export default function Layout({ notes = [], onSaveNote, onDeleteNote }) {
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
  
  // Обработчик для сохранения заметки
  const handleSaveNote = async (updatedNote) => {
    await onSaveNote(updatedNote);
    setViewMode('detail'); // После сохранения показываем заметку в режиме просмотра
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
    <div className="app-container">
      {viewMode === 'list' && (
        <NoteList 
          notes={notes} 
          selectedNote={selectedNote}
          onSelectNote={handleSelectNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
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
  );
}