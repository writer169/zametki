import { useState } from 'react';
import { FiSave, FiX, FiTag, FiFileText, FiType } from 'react-icons/fi';

export default function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [tags, setTags] = useState(note.tags?.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Пожалуйста, введите заголовок заметки');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Преобразуем теги из строки в массив
      const tagsArray = tags
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];
      
      const updatedNote = {
        ...note,
        title: title.trim(),
        content: content.trim(),
        tags: tagsArray
      };
      
      await onSave(updatedNote);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="card animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex items-center mb-1.5">
            <FiType className="w-4 h-4 text-primary-500 mr-2" />
            <label htmlFor="title" className="label">
              Заголовок
            </label>
          </div>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Введите заголовок заметки"
            required
          />
        </div>
        
        <div>
          <div className="flex items-center mb-1.5">
            <FiFileText className="w-4 h-4 text-primary-500 mr-2" />
            <label htmlFor="content" className="label">
              Содержимое
            </label>
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input"
            placeholder="Введите содержимое заметки"
            rows={10}
          />
        </div>
        
        <div>
          <div className="flex items-center mb-1.5">
            <FiTag className="w-4 h-4 text-primary-500 mr-2" />
            <label htmlFor="tags" className="label">
              Теги (разделяйте запятыми)
            </label>
          </div>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="input"
            placeholder="Работа, Проект, Идея"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isSaving}
          >
            <FiX className="w-4 h-4 mr-1.5" />
            Отмена
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
          >
            <FiSave className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}