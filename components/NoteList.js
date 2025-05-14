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
    <div className="divide-y divide-gray-200">
      {notes.map((note) => {
        const isSelected = selectedNote?._id === note._id;
        const formattedDate = new Date(note.updatedAt).toLocaleDateString();
        const contentPreview = note.content?.substring(0, 80) + (note.content?.length > 80 ? '...' : '');

        return (
          <div
            key={note._id}
            className={`p-3 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
            onClick={() => onSelectNote(note)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <h3 className="text-sm font-medium truncate">{note.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {contentPreview}
                </p>
                {note.tags?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {note.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-gray-200 text-[0.65rem] rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note._id);
                }}
                className="p-1 text-gray-400 hover:text-red-500"
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