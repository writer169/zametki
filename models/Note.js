import mongoose from 'mongoose';

// Проверяем, существует ли модель, чтобы избежать ошибки переопределения
const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Пожалуйста, укажите заголовок заметки'],
    maxlength: [100, 'Заголовок не может быть длиннее 100 символов']
  },
  content: {
    type: String,
    required: [true, 'Пожалуйста, укажите содержимое заметки'],
    // Содержимое будет храниться в зашифрованном виде
  },
  userId: {
    type: String,
    required: true,
    // Привязка к пользователю (хотя в вашем случае будет только один пользователь)
  },
  iv: {
    type: String,
    required: true,
    // Вектор инициализации для шифрования
  },
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Автоматически обновляем updatedAt перед каждым сохранением
NoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);