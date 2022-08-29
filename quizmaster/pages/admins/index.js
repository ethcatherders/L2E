import { Box, Button, FormControl, Heading, Input, Text, VStack } from "@chakra-ui/react";
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
      const Admin = Moralis.Object.extend("Admin")
      const query = new Moralis.Query(Admin)
      const results = await query.find()
      setAdmins(results)
    } catch (error) {
      console.error(error)
    }
  }

  async function search() {
    try {
      const query = new Moralis.Query(Moralis.User)
      if (searchInput.trim().startsWith('0x')) {
        query.equalTo("ethAddress", searchInput)
      } else {
        query.equalTo("username", searchInput)
      }
      const results = await query.map(result => {
        return {
          id: result.id,
          username: result.getUsername(),
          ethAddress: result.attributes.ethAddress
        }
      })
      setSearchResults([...results])
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
          <Button onClick={search}>Search</Button>
        </FormControl>
        {(searchResults.length > 0 && searchInput) && (
          <Box position='absolute' bg='rgba(36, 39, 48, 1)' borderRadius={10}>
            {searchResults.map((result, index) => (
              <Box key={index} padding={4} borderRadius={10}>
                <Text>{result.username}</Text>
                <Text>{result.ethAddress}</Text>
              </Box>
            ))}
          </Box>
        )}
        <VStack align='left' width='100%' mt={5}>
          {admins.map(admin => (
            <Box padding={2} border='1px solid grey' borderRadius={5}>
              <Text fontWeight='bold'>{admin.attributes.user.getUsername()}</Text>
              <Text>{admin.attributes.user.attributes.ethAddress}</Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Layout>
  )
}