import { AppProps } from 'next/app';
import Header from '../components/Header';
import { PostsProvider } from '../hooks/usePosts';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <PostsProvider>
      <Header />
      <Component {...pageProps} />
    </PostsProvider>
  );
}

export default MyApp;
