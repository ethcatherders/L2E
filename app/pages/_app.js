import '../styles/globals.css';
import { MoralisProvider } from 'react-moralis';
import { ChakraProvider } from '@chakra-ui/react';

function MyApp({ Component, pageProps }) {
  return (
  <ChakraProvider>
    <MoralisProvider serverUrl={process.env.MoralisServerURL} appId={process.env.MoralisAppID}>
      <Component {...pageProps} />
    </MoralisProvider>
  </ChakraProvider>
)}

export default MyApp
