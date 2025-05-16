// components/NoteList.js
import { FiTrash2, FiEdit } from 'react-icons/fi';

export default function NoteList({ notes, selectedNote, onSelectNote, onDeleteNote, onEditNote }) {
  if (!notes?.length) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        У вас пока нет заметок
      </div>
    );
  }

  return (
    <div className="notes-list-container">
      {notes.map((note) => {
        const isSelected = selectedNote?._id === note._id;
        const formattedDate = new Date(note.updatedAt).toLocaleDateString();
        // Отображаем превью контента или заглушку, если контента нет
        const contentPreview = note.content
          ? note.content.substring(0, 80) + (note.content.length > 80 ? '...' : '')
          : 'Нет содержимого...';

        return (
          <div
            key={note._id}
            className={`note-card cursor-pointer ${isSelected ? 'note-card-selected' : ''}`}
            onClick={() => onSelectNote(note)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-grow pr-16"> {/* Увеличиваем отступ справа для кнопок */}
                <h3 className="text-base font-semibold text-neutral-800 truncate">{note.title || 'Новая заметка'}</h3>
                <p className="text-xs text-neutral-500 mt-1">{formattedDate}</p>
                <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                  {contentPreview}
                </p>
                {note.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="absolute top-3 right-3 flex">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNote(note);
                  }}
                  className="p-2 text-neutral-400 hover:text-blue-500 transition-colors"
                  aria-label={`Редактировать заметку "${note.title || 'без названия'}"`}
                >
                  <FiEdit size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note._id);
                  }}
                  className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                  aria-label={`Удалить заметку "${note.title || 'без названия'}"`}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}