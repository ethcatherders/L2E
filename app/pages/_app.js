// import '../styles/globals.css';
import { MoralisProvider } from 'react-moralis';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { Web3ContextProvider } from '../context/Web3Context';

function MyApp({ Component, pageProps }) {
  const styles = {
    global: (props) => ({
      body: {
        fontFamily: 'body',
        color: mode('gray.800', 'whiteAlpha.900')(props),
        bg: mode('white', 'rgba(9, 53, 69, 1)')(props),
        lineHeight: 'base',
      },
      '*::placeholder': {
        color: mode('gray.400', 'whiteAlpha.400')(props),
      },
      '*, *::before, &::after': {
        borderColor: mode('gray.200', 'whiteAlpha.300')(props),
        wordWrap: 'break-word',
      },
    }),
  }

  const theme = extendTheme({styles})

  return (
    <ChakraProvider theme={theme}>
      <Web3ContextProvider>
        <MoralisProvider serverUrl={process.env.MoralisServerURL} appId={process.env.MoralisAppID}>
          <Component {...pageProps} />
        </MoralisProvider>
      </Web3ContextProvider>
    </ChakraProvider>
)}

export default MyApp
