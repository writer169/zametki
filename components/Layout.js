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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Защищенные заметки</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main>{children}</main>
    </>
  );
}