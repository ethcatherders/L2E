import '../styles/globals.css';
import { MoralisProvider } from 'react-moralis';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AdminContextProvider } from '../context/AdminContext';

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
    <AdminContextProvider>
      <ChakraProvider theme={theme}>
        <MoralisProvider serverUrl={process.env.MoralisServerURL} appId={process.env.MoralisAppID}>
          <Component {...pageProps} />
        </MoralisProvider>
      </ChakraProvider>
    </AdminContextProvider>
  )
}

export default MyApp
