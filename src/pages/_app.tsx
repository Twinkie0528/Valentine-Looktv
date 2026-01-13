import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0d0b0e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>LOOKTV Match Night</title>
      </Head>
      
      {/* Atmospheric overlays */}
      <div className="film-grain" />
      <div className="spotlight" />
      <div className="vignette" />
      
      <Component {...pageProps} />
    </>
  );
}
