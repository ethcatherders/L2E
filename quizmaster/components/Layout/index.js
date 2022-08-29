import { useEffect, useState } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react'
import Head from "next/head";
import { useMoralis } from "react-moralis";
import NavBar from "../NavBar";
import SideNav from '../SideNav';

export default function Layout({ children }) {
  const [ethAddress, setEthAddress] = useState('Sign Up/Sign In');
  const [isAdmin, setIsAdmin] = useState(false)
  const { user, isAuthenticated, isInitialized, Moralis } = useMoralis();

  useEffect(() => {
    if (user && isAuthenticated) {
      setEthAddress(user.attributes.ethAddress);
    }
  }, [isInitialized, user]);

  useEffect(() => {
    if (user && isInitialized && isAuthenticated) {
      getAdminAuth()
    }
  }, [user, isInitialized, isAuthenticated])

  async function getAdminAuth() {
    try {
      const Admin = Moralis.Object.extend("Admin")
      const query = new Moralis.Query(Admin)
      query.equalTo("user", user)
      const result = await query.count()
      setIsAdmin(result > 0)
    } catch (error) {
      console.error(error)
    }
  }


  return (
    <div>
      <Head>
        <title>learn2earn</title>
        <meta name="description" content="Learn about Ethereum" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box flexGrow={1}>
        <NavBar ethAddress={ethAddress} authenticated={isAuthenticated} />
        {isAdmin ? (
          <Flex direction="row">
            <Box width={250} ml={20}>
              <SideNav />
            </Box>
            <Box flexGrow={1} mr={20} height='100%'>
              {children}
            </Box>
          </Flex>
        ) : (
          <Flex flexGrow={1} align='center' justify='center'>
            <Heading>You Do NOT Have Access</Heading>
          </Flex>
        )}
      </Box>
    </div>
  )
}