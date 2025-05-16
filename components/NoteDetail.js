// components/NoteDetail.js
import { FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function NoteDetail({ note, onBack, onEdit, onDelete }) {
  if (!note) return null;
  
  const formattedDate = new Date(note.updatedAt).toLocaleDateString();
  
  return (
    <div className="note-detail-view">
      <div className="note-detail-header">
        <button 
          onClick={onBack}
          className="back-button"
          aria-label="Вернуться к списку заметок"
        >
          <FiArrowLeft className="mr-2" /> Назад к списку
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="p-2 text-neutral-500 hover:text-blue-500 transition-colors"
            aria-label={`Редактировать заметку "${note.title || 'без названия'}"`}
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
            aria-label={`Удалить заметку "${note.title || 'без названия'}"`}
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="note-content">
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">{note.title || 'Новая заметка'}</h1>
        <p className="text-sm text-neutral-500 mb-6">{formattedDate}</p>
        
        <div className="prose">
          {note.content ? (
            <p className="whitespace-pre-wrap">{note.content}</p>
          ) : (
            <p className="text-neutral-400 italic">Нет содержимого</p>
          )}
        </div>
        
        {note.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {note.tags.map((tag, i) => (
              <span key={i} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}