import { Heading, Text, Button, Box, Input, HStack, IconButton, useColorMode, useToast } from "@chakra-ui/react";
import { CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Layout from "../../../components/Layout";
import { Contract, providers, utils } from "ethers";

export default function Result() {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [mintAddress, setMintAddress] = useState(null)
  const [mintable, setMintable] = useState(false)
  const [minting, setMinting] = useState(false)
  const [minted, setMinted] = useState(false)
  const [mintId, setMintId] = useState(null)
  const [mintError, setMintError] = useState(false)

  const { user, isInitialized, Moralis } = useMoralis();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const toast = useToast();

  const minimumPassingPercentage = 1;

  useEffect(async () => {
    const { id } = router.query;
    if (isInitialized && id && user) {
      await getResult()
    }
  }, [isInitialized, user, router.query.id]);

  useEffect(() => {
    if (mintError) {
      toast({
        title: 'Something went wrong',
        description: `An error occurred while claiming.`,
        status: 'error',
        duration: 3000,
        position: 'bottom-right'
      })
    } else if (minted && mintId) {
      toast({
        title: 'NFT claimed!',
        description: `You are #${mintId} to earn this NFT!`,
        status: 'success',
        duration: 3000,
        position: 'bottom-right'
      })
    }
  }, [minted, mintId, mintError])

  async function getResult() {
    try {
      const course = await getCourse();
      const fromUser = course.attributes.responses.filter(response => response.id === router.query.entry);
      const questions = course.attributes.quiz.filter(q => !!fromUser[fromUser.length - 1].answers.find(fu => fu.id === q.id))
      const userAnswers = fromUser[fromUser.length - 1].answers.map(item => item.answer)
      const actualAnswers = questions.map(item => item.answer);
      const { match, total } = compareAnswers(userAnswers, actualAnswers);
      setScore({ correct: match, total: total });
      if (match / total >= minimumPassingPercentage) {
        const { nftAddress } = course.attributes
        if (!nftAddress) setMintable(false)
        else {
          setMintable(await isMintable(nftAddress))
          setMintAddress(nftAddress)
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getCourse() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;
    const result = await query.get(id);
    return result;
  }

  async function isMintable(contractAddress) {
    if (user) {
      const provider = new providers.Web3Provider(process.env.AlchemyUrl)
      const signer = provider.getSigner(user.attributes.ethAddress)
      const abi = new utils.Interface([
        'function claimed(address account) external view returns (bool)',
      ]);
      const contract = new Contract(
        contractAddress,
        abi,
        signer,
      );
      const isClaimed = await contract.claimed(user.attributes.ethAddress)
      return !isClaimed
    }
    return false
  }

  async function mint() {
    setMintError(false)
    setMinted(false)
    setMintId(null)
    setMinting(true)
    try {
      const provider = new providers.Web3Provider(process.env.AlchemyUrl)
      const signer = provider.getSigner(user.attributes.ethAddress)
      const abi = new utils.Interface([
        'function mint() external',
      ]);
      const contract = new Contract(
        mintAddress,
        abi,
        signer,
      );
      const tx = await contract.mint()
      await tx.wait()

      const tokenId = await contract.tokenOfOwnerByIndex(user.attributes.ethAddress, 0)
      setMintId(tokenId)
      setMinted(true)
    } catch (error) {
      console.error(error)
      setMintError(true)
    }
    setMinting(false)
  }
  
  function compareAnswers(array1, array2) {
    const result = { match: 0, total: 0 };
    console.log("array1:", array1, "array2:", array2)
    for (let i = 0; array1.length > i && array2.length > i; i++) {
      if (array2.includes(array1[i])) {
        result.match++;
      }
    }
    result.total = array2.length;
    return result;
  }

  return (
    <Layout>
      <Box
        textAlign='center'
        height='100%'
        bg={colorMode === 'dark' ? "rgba(229, 229, 229, 0.13)" : 'rgba(220, 220, 220, 1)'}
        padding={5}
      >
        {score.correct / score.total >= minimumPassingPercentage && (
          <Heading marginBottom={5}>
            Congratulations! You passed!
          </Heading>
        )}
        <Heading size='md' marginBottom={5}>
          {score.correct}/{score.total} Correct
        </Heading>
        {score.correct / score.total >= minimumPassingPercentage ? (
          <Box>
            {!mintable ? (
              <Link href='/' passHref>
                <Button mt={2}>
                  Back to Home
                </Button>
              </Link>
            ) : (
              <>
              <Text>
                {mintId && minted ? `You earned NFT #${mintId}!` : 'You earned an NFT as a reward.'}
              </Text>
              <Button
                backgroundColor='rgba(32, 223, 127, 1)'
                _hover={{ backgroundColor: 'rgba(32, 223, 127, 0.5)' }}
                onClick={() => !minted ? mint() : router.push('/poaps')}
                isLoading={minting}
                loadingText="Claiming..."
              >
                {minted ? 'View NFTs earned' : 'Claim'}
              </Button>
              <Link href='/' passHref>
                <Button mt={2}>
                  Back to Home
                </Button>
              </Link>
              </>
            )}
          </Box>
        ) : (
          <Box>
            <Text>
              Better luck next time :(
            </Text>
            <Link href='/' passHref>
              <Button mt={2}>
                Back to Home
              </Button>
            </Link>
          </Box>
        )}
      </Box>
    </Layout>
  )
}