import { Html, Head, Main, NextScript } from 'next/document';

// WHY: Fonts load once from here (the SCSS no longer @imports them). Raleway is for headings, DM Sans for text;
// the weights match what the styles use, so the browser never fakes bold. Keep in sync with $font-url in _typography.scss
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Raleway:wght@400;500;600;700;800;900&display=swap';

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_URL} rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
