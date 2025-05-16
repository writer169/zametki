// components/NoteList.js
import { FiTrash2 } from 'react-icons/fi';

export default function NoteList({ notes, selectedNote, onSelectNote, onDeleteNote }) {
  if (!notes?.length) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        У вас пока нет заметок
      </div>
    );
  }

  return (
    // Оборачиваем в контейнер со скроллом и добавляем отступы
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
            // Применяем классы note-card и note-card-selected
            className={`note-card cursor-pointer ${isSelected ? 'note-card-selected' : ''}`}
            onClick={() => onSelectNote(note)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-grow pr-8"> {/* Увеличиваем отступ справа для кнопки */}
                <h3 className="text-base font-semibold text-neutral-800 truncate">{note.title || 'Новая заметка'}</h3> {/* Улучшаем заголовок */}
                <p className="text-xs text-neutral-500 mt-1">{formattedDate}</p> {/* Используем neutral-500 для даты */}
                <p className="text-sm text-neutral-600 mt-2 line-clamp-2"> {/* Увеличиваем размер текста превью */}
                  {contentPreview}
                </p>
                {note.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2"> {/* Увеличиваем отступ и gap для тегов */}
                    {note.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="tag" // Используем класс .tag
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем срабатывание onClick карточки
                  onDeleteNote(note._id);
                }}
                className="p-2 text-neutral-400 hover:text-red-500 transition-colors absolute top-3 right-3" // Позиционируем кнопку абсолютно
                aria-label={`Удалить заметку "${note.title || 'без названия'}"`} // Добавляем aria-label для доступности
              >
                <FiTrash2 size={18} /> {/* Увеличиваем размер иконки */}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}