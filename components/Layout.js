import { signOut, useSession } from 'next-auth/react';
import Head from 'next/head';

export default function Layout({ children }) {
  const { data: session } = useSession();
  
  return (
    <>
      <Head>
        <title>Защищенные заметки</title>
        <meta name="description" content="Безопасное приложение для хранения заметок" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {session && (
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center py-4">
              <h1 className="text-lg font-bold mb-2 sm:mb-0">Защищенные заметки</h1>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-600 truncate max-w-[120px]">
                  {session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className="overflow-hidden">{children}</main>
    </>
  );
}