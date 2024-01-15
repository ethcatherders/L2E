import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  connectorsForWallets
} from '@rainbow-me/rainbowkit';
import { injectedWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { SessionProvider } from 'next-auth/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  polygon, polygonMumbai, mainnet
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

// import '../styles/globals.css';
import { MoralisProvider } from 'react-moralis';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { Web3ContextProvider } from '../context/Web3Context';

const { chains, publicClient } = configureChains(
  [polygon, polygonMumbai, mainnet],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_DEV_KEY }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_NAME,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

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
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <MoralisProvider serverUrl={process.env.MoralisServerURL} appId={process.env.MoralisAppID}>
              <Component {...pageProps} />
            </MoralisProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </Web3ContextProvider>
    </ChakraProvider>
)}

export default MyApp
