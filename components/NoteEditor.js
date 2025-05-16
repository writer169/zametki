// components/NoteEditor.js
import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

export default function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [tags, setTags] = useState(note.tags?.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Введите заголовок');
    
    setIsSaving(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      await onSave({ ...note, title: title.trim(), content: content.trim(), tags: tagsArray });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="note-editor-container">
      <div className="note-detail-header">
        <button 
          onClick={onCancel}
          className="back-button"
          aria-label="Вернуться к списку заметок"
        >
          <FiArrowLeft className="mr-2" /> Отменить редактирование
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Заголовок</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Название заметки"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Содержимое</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            rows={10} // Увеличиваем количество строк для лучшего UX
            placeholder="Текст вашей заметки..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Теги</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="работа, личное, идеи..."
          />
        </div>

        <div className="flex gap-2 pt-4"> {/* Увеличиваем отступ сверху */}
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}