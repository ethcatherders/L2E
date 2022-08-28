import '../styles/globals.css';
import { MoralisProvider } from 'react-moralis';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

function MyApp({ Component, pageProps }) {
  const styles = {
    global: (props) => ({
      body: {
        fontFamily: 'body',
        color: 'whiteAlpha.900',
        bg: 'rgba(9, 53, 69, 1)',
        lineHeight: 'base',
      }
    }),
  }

  const theme = extendTheme({styles})

  return (
  <ChakraProvider theme={theme}>
    <MoralisProvider serverUrl={process.env.MoralisServerURL} appId={process.env.MoralisAppID}>
      <Component {...pageProps} />
    </MoralisProvider>
  </ChakraProvider>
)}

export default MyApp
