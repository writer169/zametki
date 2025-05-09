import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import '../styles/globals.css';

// Опции для SWR
const swrOptions = {
  fetcher: (url) => fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error('Ошибка API: ' + res.status);
    }
    return res.json();
  }),
  revalidateOnFocus: false,
  shouldRetryOnError: false
};

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <SWRConfig value={swrOptions}>
        <Component {...pageProps} />
      </SWRConfig>
    </SessionProvider>
  );
}

export default MyApp;