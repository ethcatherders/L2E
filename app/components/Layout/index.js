import { useEffect, useState } from 'react';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import NavBar from "../NavBar";
import styles from '../../styles/Home.module.css';

export default function Layout({ children }) {
  const [ethAddress, setEthAddress] = useState('Sign Up/Sign In');
  const { user, isAuthenticated, isInitialized } = useMoralis();

  useEffect(() => {
    if (user && isAuthenticated) {
      setEthAddress(user.attributes.ethAddress);
    }
  }, [isInitialized]);

  return (
    <div>
      <Head>
        <title>learn2earn</title>
        <meta name="description" content="Learn about Ethereum" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar ethAddress={ethAddress} authenticated={isAuthenticated} />
      {children}

      <footer className={styles.footer}>
        <a
          href="https://www.ethereumcatherders.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with ❤️ from the Ethereum Cat Herders
        </a>
      </footer>
    </div>
  )
}