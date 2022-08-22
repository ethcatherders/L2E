import { useEffect, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react'
import Head from "next/head";
import { useMoralis } from "react-moralis";
import NavBar from "../NavBar";
import SideNav from '../SideNav';

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

      <Box flexGrow={1}>
        <NavBar ethAddress={ethAddress} authenticated={isAuthenticated} />
        <Flex direction="row">
          <Box width={250} ml={20}>
            <SideNav />
          </Box>
          <Box flexGrow={1} mr={20} height='100%'>
            {children}
          </Box>
        </Flex>
      </Box>
    </div>
  )
}