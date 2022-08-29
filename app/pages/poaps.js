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
  Image,
  SkeletonCircle
} from "@chakra-ui/react";

export default function PoapsEarned() {
  const [loading, setLoading] = useState(true)
  const [poaps, setPoaps] = useState([]);
  const { user, isInitialized, Moralis } = useMoralis();
  
  useEffect(async () => {
    if (isInitialized && user) {
      await getPoapsEarned()
      setLoading(false)
    }
  }, [isInitialized, user]);

  // Query user's profile to get POAPs earned
  async function getPoapsEarned() {
    if (user.attributes.poapsEarned) {
      const list = await Promise.all(user.attributes.poapsEarned.map(async (item) => {
        try {
          const POAP = Moralis.Object.extend("POAP")
          const query = new Moralis.Query(POAP)
          const result = await query.get(item.id)
          return {
            ...item,
            name: result.attributes.name,
            image: result.attributes.image
          }
        } catch (error) {
          console.error(error)
          return {
            ...item,
            name: 'Unknown',
            image: null
          }
        }
      }))
      setPoaps(list)
    }
  }

  return (
    <Layout>
      <Box background="rgba(229, 229, 229, 0.13)" padding={5}>
        <Heading size="md" mb={5}>POAPs Earned</Heading>
        {!loading ?
          <Box>
            {poaps.length ? poaps.map((poap, index) => 
              <HStack gap={5} key={index}>
                <AspectRatio width={100} ratio={1/1}>
                  <Image
                    src={poap.image && `https://gateway.moralisipfs.com/ipfs/${poap.image}`}
                    objectFit='cover'
                    fallback={poap.image && <SkeletonCircle width={100} height={100} />}
                  />
                </AspectRatio>
                <VStack align='left'>
                  <Heading size='sm'>{poap.name}</Heading>
                  <Text>Completed on {poap.timestamp ? (new Date(poap.timestamp)).toLocaleDateString() : 'N/A'}</Text>
                </VStack>
              </HStack>
            ) : <Text>Start some courses and ace the quizzes to earn POAPs!</Text>}
          </Box>
          :
          <Center>
            <Spinner
              thickness='4px'
              speed='0.65s'
              color='gray.500'
              size='xl'
            />
          </Center>
        }
      </Box>
    </Layout>
  )
}