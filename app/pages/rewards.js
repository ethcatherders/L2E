import { useContext, useEffect, useState } from "react";
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
import { Web3Context } from "../context/Web3Context";
import { BigNumber } from "ethers";

export default function RewardsEarned() {
  const { devMode } = useContext(Web3Context)
  const [loading, setLoading] = useState(true)
  const [allRewards, setAllRewards] = useState([])
  const [nfts, setNfts] = useState([])
  const { user, isInitialized, Moralis } = useMoralis();
  
  useEffect(async () => {
    if (isInitialized && user) {
      await getNFTsEarned()
    }
  }, [isInitialized, user, devMode]);

  async function getNFTsEarned() {
    setLoading(true)
    if (user.attributes.coursesCompleted && user.attributes.coursesCompleted.length >= 1) {
      const { coursesCompleted } = user.attributes
      console.log("Courses Completed", coursesCompleted)
      const RewardNFT = Moralis.Object.extend("RewardNFT")
      const query = new Moralis.Query(RewardNFT)
      const rewards = await query.filter((reward) => {
        const courseIds = coursesCompleted.map(course => course.id)
        return courseIds.includes(reward.attributes.course)
      })
      console.log(rewards)
      setAllRewards(rewards)

      const contracts = rewards.map(reward => {return {address: reward.attributes.address, chainId: reward.attributes.chainId}})
      const contractsFiltered = contracts.filter(contract => !!contract.address && (devMode ? contract.chainId === 80001 : contract.chainId === 137))
      const addresses = contractsFiltered.map(contract => contract.address)
      if (addresses.length >= 1) {
        const res = await fetch(devMode ? 
          `https://polygon-mumbai.g.alchemy.com/nft/v2/${process.env.AlchemyKey_Dev}/getNFTs?owner=${user.attributes.ethAddress}&contractAddresses=${addresses}&withMetadata=true`
          : `https://polygon-mainnet.g.alchemy.com/nft/v2/${process.env.AlchemyKey}/getNFTs?owner=${user.attributes.ethAddress}&contractAddresses=${addresses}&withMetadata=true`
        )
        const response = await res.json()
        console.log(response)
        const parsed = response.ownedNfts.map(item => {
          const matchedReward = rewards.find(reward => reward.attributes.address.toLowerCase() === item.contract.address.toLowerCase())
          console.log("matchedReward: ", matchedReward)
          const course = matchedReward ? coursesCompleted.find(cc => cc.id === matchedReward.attributes.course) : undefined
          let courseTitle = "";
          if (course) {
            courseTitle = course.attributes.title
          }
          return {
            courseTitle,
            address: item.contract.address,
            tokenId: BigNumber.from(item.id.tokenId).toNumber(),
            image: item.metadata.image
          }
        })
        setNfts(parsed)
      }
    }
    setLoading(false)
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
                  src={token.image && `https://gateway.moralisipfs.com/ipfs/${token.image.substring("ipfs://".length)}`}
                  objectFit='cover'
                  borderRadius='full'
                  boxSize='100px'
                  alt="NFT image"
                  fallback={<SkeletonCircle width={100} height={100} />}
                />
                <VStack align='left'>
                  <Heading size='sm'>{token.courseTitle}</Heading>
                  <Heading size='md'>#{token.tokenId}</Heading>
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