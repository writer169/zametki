// components/NoteEditor.js
import { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

export default function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [tags, setTags] = useState(note.tags?.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);

  // Обработчик для обновления заголовка на основе содержания
  useEffect(() => {
    if (!title && content.trim()) {
      // Устанавливаем заголовок автоматически только если пользователь ввел текст, но не заголовок
      const autoTitle = content.trim().substring(0, 10) + (content.length > 10 ? '...' : '');
      // Не устанавливаем в state, чтобы не мешать пользователю, если он решит ввести заголовок
    }
  }, [content, title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Если заголовок пустой, но есть содержание, используем первые 10 символов содержания
    let finalTitle = title.trim();
    if (!finalTitle && content.trim()) {
      finalTitle = content.trim().substring(0, 10) + (content.length > 10 ? '...' : '');
    } else if (!finalTitle) {
      finalTitle = 'Заметка без названия';
    }
    
    setIsSaving(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      await onSave({ 
        ...note, 
        title: finalTitle, 
        content: content.trim(), 
        tags: tagsArray 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="note-editor-container">
      {/* Верхняя панель с кнопками действий */}
      <div className="sticky top-0 z-10 bg-white shadow-sm py-2 px-3 flex justify-between items-center border-b mb-4">
        <button 
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800 p-2"
          aria-label="Отменить редактирование"
        >
          <FiX size={20} />
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={isSaving || (!title.trim() && !content.trim())}
          className={`flex items-center px-4 py-1.5 rounded-md text-sm ${
            isSaving || (!title.trim() && !content.trim()) 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <FiSave className="mr-1" /> {isSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="px-3 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Заголовок</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Название заметки (автоматически заполнится из текста)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Содержимое</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            rows={14}
            placeholder="Текст вашей заметки..."
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Теги</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="работа, личное, идеи... (через запятую)"
          />
        </div>

        {/* Отступ внизу для скролла на мобильных устройствах */}
        <div className="h-16"></div>
      </form>
    </div>
  );
}