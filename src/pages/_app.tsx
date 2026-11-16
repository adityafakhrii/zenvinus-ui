import '@/styles/tailwind.css';
import type { AppProps } from 'next/app';
import { Providers } from '@/providers/app-providers';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
