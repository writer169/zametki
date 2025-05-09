/**
 * utils/api.js
 * Функции для работы с API
 */

// Базовый обработчик запросов к API
export async function fetchAPI(endpoint, options = {}) {
  // Устанавливаем заголовки по умолчанию
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Объединяем опции
  const config = {
    method: options.method || 'GET',
    ...options,
    headers,
  };

  // Если есть тело запроса и это не FormData, преобразуем в JSON
  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(endpoint, config);

    // Проверяем статус ответа
    if (!response.ok) {
      // Пытаемся получить сообщение об ошибке из ответа
      let errorText = 'Ошибка при выполнении запроса';
      
      try {
        const errorData = await response.json();
        errorText = errorData.message || errorText;
      } catch (e) {
        // Если не удалось получить JSON, используем текст статуса
        errorText = response.statusText;
      }

      throw new Error(errorText);
    }

    // Для запросов DELETE или если ответ пустой, возвращаем { success: true }
    if (config.method === 'DELETE' || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    // Для всех остальных запросов возвращаем данные в формате JSON
    return await response.json();
  } catch (error) {
    console.error('API ошибка:', error);
    throw error;
  }
}

// Функции для работы с заметками
export const notesAPI = {
  // Получить все заметки
  getAll: async () => {
    return fetchAPI('/api/notes');
  },

  // Получить одну заметку по ID
  getById: async (id) => {
    return fetchAPI(`/api/notes/${id}`);
  },

  // Создать новую заметку
  create: async (noteData) => {
    return fetchAPI('/api/notes', {
      method: 'POST',
      body: noteData,
    });
  },

  // Обновить существующую заметку
  update: async (id, noteData) => {
    return fetchAPI(`/api/notes/${id}`, {
      method: 'PUT',
      body: noteData,
    });
  },

  // Удалить заметку
  delete: async (id) => {
    return fetchAPI(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  },

  // Поиск заметок (можно добавить в будущем)
  search: async (query) => {
    return fetchAPI(`/api/notes/search?q=${encodeURIComponent(query)}`);
  },
};

// Функции для работы с аутентификацией
// Эти функции дополняют функциональность next-auth, предоставляя удобные враперы
export const authAPI = {
  // Проверка статуса аутентификации
  checkAuth: async () => {
    try {
      const response = await fetchAPI('/api/auth/session');
      return { isAuthenticated: !!response.user, user: response.user };
    } catch (error) {
      return { isAuthenticated: false, user: null };
    }
  },

  // Получение данных профиля (можно расширить в будущем)
  getProfile: async () => {
    return fetchAPI('/api/auth/me');
  },
};