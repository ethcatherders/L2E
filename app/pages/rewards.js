import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Layout from "../components/Layout";
import { 
  VStack,
  Box,
  Center,
  Spinner,
  Heading,
  Text,
  HStack,
  Image,
  SkeletonCircle,
} from "@chakra-ui/react";

export default function PoapsEarned() {
  const [loading, setLoading] = useState(true)
  const [nfts, setNfts] = useState([])
  const { user, isInitialized } = useMoralis();
  
  useEffect(async () => {
    if (isInitialized && user) {
      await getNFTsEarned()
      setLoading(false)
    }
  }, [isInitialized, user]);

  async function getNFTsEarned() {
    if (user.attributes.coursesCompleted && user.attributes.coursesCompleted.length >= 1) {
      const { coursesCompleted } = user.attributes
      console.log("Courses Completed", coursesCompleted)

      const addresses = coursesCompleted.map(course => course.attributes.nftAddress)
      const contracts = addresses.filter(address => !!address)
      if (contracts.length >= 1) {
        const res = await fetch(`https://polygon-mumbai.g.alchemy.com/nft/v2/${process.env.AlchemyKey}/getNFTs?owner=${user.attributes.ethAddress}&contractAddresses=${contracts}&withMetadata=true`)
        const response = await res.json()
        console.log(response)
        const parsed = response.ownedNfts.map(item => {
          const course = coursesCompleted.find(cc => cc.attributes.nftAddress === item.contract.address)
          let courseTitle;
          if (course) {
            courseTitle = course.attributes.title
          }
          return {
            courseTitle,
            address: item.contract.address,
            tokenId: item.id.tokenId,
            image: item.metadata.image
          }
        })
        setNfts(parsed)
      }
    }
  }

  return (
    <Layout>
      <Box background="rgba(229, 229, 229, 0.13)" padding={5} minH='70vh'>
        {/* <Heading size="md" mb={5}>My NFT Rewards</Heading> */}
        {!loading ?
          <Box>
            {nfts.length ? nfts.map((token, index) => 
              <HStack gap={5} key={index} mb={5}>
                <Image
                  src={token.image}
                  objectFit='cover'
                  borderRadius='full'
                  boxSize='100px'
                  alt="NFT image"
                  fallback={token.image && <SkeletonCircle width={100} height={100} />}
                />
                <VStack align='left'>
                  <Heading size='sm'>{courseTitle}</Heading>
                  <Heading size='md'>{token.tokenId}</Heading>
                </VStack>
              </HStack>
            ) : (
              <Center minH='60vh'>
                <Text>Start some courses and ace the quizzes to earn NFT rewards!</Text>
              </Center>
            )}
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