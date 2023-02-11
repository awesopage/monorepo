import type { AppProps } from 'next/app'

const AwesopageApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return <Component {...pageProps} />
}

export default AwesopageApp
