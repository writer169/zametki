// components/Layout.js
import { useSession, signOut } from 'next-auth/react';
import Head from 'next/head';
import { useState } from 'react';
import NoteList from './NoteList';
import NoteDetail from './NoteDetail';
import NoteEditor from './NoteEditor';

export default function Layout({ children, notes = [], onSaveNote, onDeleteNote }) {
  const { data: session } = useSession();

  const [selectedNote, setSelectedNote] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'edit'

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setViewMode('detail');
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedNote(null);
  };

  const handleSaveNote = async (updatedNote) => {
    await onSaveNote(updatedNote);
    setViewMode('detail');
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      await onDeleteNote(noteId);
      if (selectedNote && selectedNote._id === noteId) {
        handleBackToList();
      }
    }
  };

  return (
    <>
      <Head>
        <title>Защищенные заметки</title>
        <meta name="description" content="Безопасное приложение для хранения заметок" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {session && (
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center py-4">
              <h1 className="text-lg font-bold mb-2 sm:mb-0">Защищенные заметки</h1>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-600 truncate max-w-[120px]">
                  {session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="overflow-hidden p-4">
        {session ? (
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
        ) : (
          children // например, <LoginPage /> или что-то ещё
        )}
      </main>
    </>
  );
}