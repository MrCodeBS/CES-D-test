import '../styles/globals.css'

// Ensure this is the only export default in this file
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
