import { RecoilRoot } from 'recoil';
import { ChakraProvider } from '@chakra-ui/react';
import Layout from '../components/Layout';
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <ChakraProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </RecoilRoot>
  );
}
