import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Setup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  
  const router = useRouter();
  const { data: session } = useSession();
  
  // Если пользователь уже авторизован, перенаправляем на главную страницу
  useEffect(() => {
    if (session) {
      router.replace('/');
    }
    
    // Проверяем, существует ли уже пользователь
    async function checkUserExists() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        // Если есть доступные сессии, значит пользователь уже настроен
        if (data && data.providers && data.providers.includes('credentials')) {
          setUserExists(true);
        }
      } catch (error) {
        console.error('Ошибка при проверке существующих пользователей:', error);
      }
    }
    
    checkUserExists();
  }, [session, router]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !setupToken) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${setupToken}`
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при настройке пользователя');
      }
      
      setSuccess(`Пользователь ${data.email} успешно создан! Перенаправление на страницу входа...`);
      
      // Перенаправляем на страницу входа через 3 секунды
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Произошла ошибка. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };
  
  // Если пользователь уже существует, показываем сообщение
  if (userExists) {
    return (
      <>
        <Head>
          <title>Настройка | Защищенные заметки</title>
        </Head>
        
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Настройка приложения</h1>
            
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              Приложение уже настроено. Пользователь существует.
            </div>
            
            <div className="flex items-center justify-center">
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Перейти на страницу входа
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>Настройка | Защищенные заметки</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Первоначальная настройка</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email для входа
              </label>
              <input
                id="email"
                type="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Используйте надежный пароль - он будет использоваться для шифрования данных.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="setupToken">
                Токен настройки
              </label>
              <input
                id="setupToken"
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Введите токен, указанный в переменной окружения SETUP_TOKEN.
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                disabled={loading}
              >
                {loading ? 'Создание пользователя...' : 'Создать пользователя'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}