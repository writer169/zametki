// components/NoteDetail.js
import { FiEdit, FiTrash2 } from 'react-icons/fi';

export default function NoteDetail({ note, onBack, onEdit, onDelete }) {
  if (!note) return null;
  
  const formattedDate = note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : '';
  
  return (
    <div className="note-detail-view">
      <div className="sticky top-0 z-10 bg-white shadow-sm py-2 px-3 flex justify-between items-center border-b mb-4">
        <h1 className="text-lg font-bold text-neutral-800 truncate flex-1">{note.title || 'Новая заметка'}</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="p-2 text-neutral-500 hover:text-blue-500 transition-colors"
            aria-label={`Редактировать заметку "${note.title || 'без названия'}"`}
          >
            <FiEdit size={20} />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
            aria-label={`Удалить заметку "${note.title || 'без названия'}"`}
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      </div>
      
      <div className="note-content px-4">
        {formattedDate && (
          <p className="text-sm text-neutral-500 mb-6">{formattedDate}</p>
        )}
        
        <div className="prose max-w-none">
          {note.content ? (
            <p className="whitespace-pre-wrap">{note.content}</p>
          ) : (
            <p className="text-neutral-400 italic">Нет содержимого</p>
          )}
        </div>
        
        {note.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {note.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-200 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Отступ внизу для скролла на мобильных устройствах */}
        <div className="h-16"></div>
      </div>
    </div>
  );
}