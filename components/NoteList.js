import { FiTrash2 } from 'react-icons/fi';

export default function NoteList({ notes, selectedNote, onSelectNote, onDeleteNote }) {
  // Если заметок нет, показываем сообщение
  if (!notes || notes.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        У вас пока нет заметок
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-gray-200">
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
            className={`p-4 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div 
                className="flex-grow"
                onClick={() => onSelectNote(note)}
              >
                <h3 className="text-md font-semibold">{note.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{contentPreview}</p>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="mr-1 mb-1 px-2 py-0.5 bg-gray-200 text-xs rounded-full text-gray-700"
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
                className="ml-2 p-1 text-gray-500 hover:text-red-500"
                title="Удалить заметку"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}