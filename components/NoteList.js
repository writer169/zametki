import { FiTrash2, FiClock, FiTag } from 'react-icons/fi';

export default function NoteList({ notes, selectedNote, onSelectNote, onDeleteNote }) {
  // Если заметок нет, показываем сообщение
  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-500 bg-white rounded-xl shadow-card min-h-[150px]">
        <svg className="w-12 h-12 text-neutral-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="font-medium">У вас пока нет заметок</p>
        <p className="text-sm mt-1">Создайте новую заметку, чтобы начать</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {notes.map((note) => {
        const isSelected = selectedNote && note._id === selectedNote._id;
        
        // Форматируем дату
        const updatedDate = new Date(note.updatedAt);
        const formattedDate = updatedDate.toLocaleDateString();
        
        // Для содержимого показываем только превью
        const contentPreview = note.content
          ? note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')
          : '';
        
        return (
          <div
            key={note._id}
            className={`note-card p-4 cursor-pointer ${isSelected ? 'note-card-selected' : ''}`}
            onClick={() => onSelectNote(note)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-neutral-800">{note.title}</h3>
                
                <div className="flex items-center mt-1.5 text-xs text-neutral-500">
                  <FiClock className="w-3 h-3 mr-1" />
                  <span>{formattedDate}</span>
                </div>
                
                {contentPreview && (
                  <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{contentPreview}</p>
                )}
                
                {note.tags && note.tags.length > 0 && (
                  <div className="mt-3 flex items-center flex-wrap gap-1.5">
                    <FiTag className="w-3 h-3 text-neutral-400" />
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="tag"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем выбор заметки
                  onDeleteNote(note._id);
                }}
                className="ml-2 p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Удалить заметку"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}