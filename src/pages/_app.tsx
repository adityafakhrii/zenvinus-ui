import '@/styles/index.scss';
import type { AppProps } from 'next/app';
import { Providers } from '@/providers/app-providers';

if (typeof window !== 'undefined') {
  // Bootstrap's JS (dropdowns, collapse) touches the DOM when it loads, so it is only required in the browser
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('bootstrap/dist/js/bootstrap');
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
