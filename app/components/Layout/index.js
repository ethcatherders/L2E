import { useEffect, useState } from 'react';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import NavBar from "../NavBar";
import SideNav from '../SideNav';
import styles from '../../styles/Home.module.css';
import { Flex, Box } from '@chakra-ui/react';

export default function Layout({ children }) {
  return (
    <Flex direction="column" height="100vh">
      <Head>
        <title>learn2earn</title>
        <meta name="description" content="Learn about Ethereum" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box flexGrow={1}>
        <NavBar />
        <Flex direction="row">
          <Box width={250} ml={20}>
            <SideNav />
          </Box>
          <Box flexGrow={1} mr={20}>
            {children}
          </Box>
        </Flex>
      </Box>

      <footer className={styles.footer}>
        <a
          href="https://www.ethereumcatherders.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with ❤️ from the Ethereum Cat Herders
        </a>
      </footer>
    </Flex>
  )
}