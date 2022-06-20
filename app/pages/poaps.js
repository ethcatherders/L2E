import { useEffect, useRef, useState } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from 'next/router';
import NextLink from "next/link";
import Layout from "../components/Layout";
import { 
  VStack,
  Box,
  Center,
  Spinner,
  Heading,
  Link,
  Text,
  HStack,
  AspectRatio,
  Image
} from "@chakra-ui/react";

export default function PoapsEarned() {
  const [loading, setLoading] = useState(false)
  const [poaps, setPoaps] = useState([]);
  const { user, isInitialized, Moralis } = useMoralis();
  
  useEffect(async () => {
    if (isInitialized) {
      
    }
  }, [isInitialized]);

  // Query user's profile to get POAPs earned
  async function getPoapsEarned() {}

  return (
    <Layout>
      <Box background="rgba(229, 229, 229, 0.13)" padding={5}>
        {!loading ?
          <Box>
            <Heading size="md" mb={5}>POAPs Earned</Heading>
            {poaps.length ? poaps.map((poap, index) => 
              <HStack gap={5} key={index}>
                <AspectRatio maxW={100} ratio={1/1}>
                  <Image src={poap.image} objectFit='cover' />
                </AspectRatio>
                <Text>Completed on {poap.timestamp}</Text>
              </HStack>
            ) : <Text>Start some courses and ace the quizzes to earn POAPs!</Text>}
          </Box>
          :
          <Center>
            <Spinner
              thickness='4px'
              speed='0.65s'
              // emptyColor='gray.200'
              color='gray.500'
              size='xl'
            />
          </Center>
        }
      </Box>
    </Layout>
  )
}