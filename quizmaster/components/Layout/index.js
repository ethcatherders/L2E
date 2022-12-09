import { useContext, useEffect, useState } from 'react';
import { Box, Flex, Heading, Spinner, Center } from '@chakra-ui/react'
import Head from "next/head";
import { useMoralis } from "react-moralis";
import NavBar from "../NavBar";
import SideNav from '../SideNav';
import { AdminContext } from '../../context/AdminContext';

export default function Layout({ children }) {
  const {
    ethAddress,
    setEthAddress,
    isAdmin,
    setIsAdmin
  } = useContext(AdminContext)
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
        <title>L2E Quizmaster</title>
        <meta name="description" content="Admin portal for Ethereum Cat Herders' Learn2Earn" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box flexGrow={1}>
        <NavBar ethAddress={ethAddress} authenticated={isAuthenticated} />
        {isInitialized ? (
          <>
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
          </>
        ) : (
          <Center width='100%' height='100%'>
            <Spinner width={50} height={50} />
          </Center>
        )}
      </Box>
    </div>
  )
}