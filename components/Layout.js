import { signOut, useSession } from 'next-auth/react';
import Head from 'next/head';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useState } from 'react';

export default function Layout({ children }) {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  return (
    <>
      <Head>
        <title>Защищенные заметки</title>
        <meta name="description" content="Безопасное приложение для хранения заметок" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {session && (
        <header className="sticky top-0 bg-white shadow-sm z-10">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 mr-3 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-secondary-700 text-transparent bg-clip-text">
                  Защищенные заметки
                </h1>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-1 text-neutral-700 hover:text-primary-600 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <FiUser className="w-5 h-5" />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-soft border border-neutral-200 animate-fade-in">
                    <div className="p-3 border-b border-neutral-200">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center space-x-2 p-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                      >
                        <FiLogOut className="w-4 h-4 text-red-500" />
                        <span>Выйти</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className="max-w-5xl mx-auto px-4 py-4 md:py-6">
        {children}
      </main>
      
      {session && (
        <footer className="mt-8 py-4 bg-neutral-100">
          <div className="max-w-5xl mx-auto px-4 text-center text-xs text-neutral-500">
            <p>© 2025 Защищенные заметки. Все ваши данные зашифрованы.</p>
          </div>
        </footer>
      )}
    </>
  );
}