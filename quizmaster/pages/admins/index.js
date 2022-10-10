import { Box, Button, FormControl, Heading, Input, Text, VStack, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Layout from "../../components/Layout";

export default function Admins() {
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [admins, setAdmins] = useState([])

  const { Moralis, isInitialized } = useMoralis()

  useEffect(() => {
    if (isInitialized) {
      getAdmins()
    }
  }, [isInitialized])

  useEffect(() => {
    if (searchInput && isInitialized) {
      search()
    }
  }, [isInitialized, searchInput])

  async function getAdmins() {
    try {
      const results = await Moralis.Cloud.run("getAdmins")
      if (!results) return
      setAdmins(results)
    } catch (error) {
      console.error(error)
    }
  }

  async function search() {
    try {
      const params = {username: searchInput.trim(), ethAddress: searchInput.trim()}

      const results = await Moralis.Cloud.run("searchForUser", params)
      if (results && results.length) {
        setSearchResults([...results])
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function addAdmin(id) {
    try {
      const params = { id }
      const response = await Moralis.Cloud.run("addAdmin", params)
      console.log("Added admin:", response.success)
      await getAdmins()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Layout>
      <Box>
        <Heading mb={5} mt={2}>Admins</Heading>
        <FormControl display='flex' gap={2}>
          <Input
            type='search'
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
          />
          <Button onClick={search} color='white' backgroundColor='black'>Search</Button>
        </FormControl>
        {(searchResults.length > 0 && searchInput) && (
          <Box position='absolute' bg='rgba(36, 39, 48, 1)' borderRadius={10}>
            {searchResults.map((result, index) => (
              <HStack
                key={index}
                padding={4}
                borderRadius={10}
                justify='space-between'
                align='center'
                gap={10}
              >  
                <Box>
                  <Text>{result.username}</Text>
                  <Text>{result.ethAddress}</Text>
                </Box>
                <Button onClick={() => addAdmin(result.id)} color='white' backgroundColor='black'>
                  Add Admin
                </Button>
              </HStack>
            ))}
          </Box>
        )}
        <VStack align='left' width='100%' mt={5}>
          {admins.map(admin => (
            <Box padding={2} border='1px solid grey' borderRadius={5} key={admin.id}>
              <Text fontWeight='bold'>{admin.username}</Text>
              <Text>{admin.ethAddress}</Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Layout>
  )
}