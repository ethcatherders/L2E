import '../styles/globals.css';
import { MoralisProvider } from 'react-moralis';

function MyApp({ Component, pageProps }) {
  return <MoralisProvider serverUrl={process.env.MoralisServerURL} appId={process.env.MoralisAppID}>
    <Component {...pageProps} />
  </MoralisProvider>
}

export default MyApp
