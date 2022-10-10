import { useEffect, useState } from 'react';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import NavBar from "../NavBar";
import SideNav from '../SideNav';
import styles from '../../styles/Home.module.css';
import { Flex, Box, Text, Link, Spinner } from '@chakra-ui/react';

export default function Layout({ children }) {
  const { isInitialized } = useMoralis()
  return (
    <Flex direction="column" height="100vh">
      <Head>
        <title>ECH Learn-2-Earn</title>
        <meta name="description" content="Learn about Ethereum and get rewarded." />
        <link rel="icon" href="/ECHLogo.png" />
      </Head>

      <Box flexGrow={1}>
        <NavBar />
        <Flex direction="row">
          <Box width={250} ml={20}>
            <SideNav />
          </Box>
          {isInitialized ? (
            <Box flexGrow={1} mr={20} height='100%'>
              {children}
            </Box>
          ) : (
            <Flex width='100%' height='100%' justify='center' align='center'>
              <Spinner width={100} height={100} />
            </Flex>
          )}
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
        <Flex gap={1}>
          <Text>Please share your feedback</Text>
          <Link href="https://forms.gle/hGrMsGrStk9z7xc27" isExternal textDecor='underline'>here</Link>
        </Flex>
      </footer>
    </Flex>
  )
}