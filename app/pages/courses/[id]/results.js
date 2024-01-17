import {
  Heading,
  Link,
  Text,
  Button,
  Box,
  useColorMode,
  useToast,
  Flex,
  Center,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState, useMemo } from "react";
import { useMoralis } from "react-moralis";
import Layout from "../../../components/Layout";
import { Contract, providers, utils } from "ethers";
import { Web3Context } from "../../../context/Web3Context";
import { TwitterIcon } from "../../../components/Icons";

import Confetti from "react-confetti";

export default function Result() {
  const { devMode } = useContext(Web3Context);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [mintAddress, setMintAddress] = useState(null);
  const [mintable, setMintable] = useState(false);
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [mintId, setMintId] = useState(null);
  const [mintError, setMintError] = useState(false);

  const { user, isInitialized, Moralis, chainId } = useMoralis();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const toast = useToast();

  const minimumPassingPercentage = 1;

  const passed = useMemo(() => {
    return score.correct / score.total >= minimumPassingPercentage;
  }, [score.correct, score.total]);

  useEffect(async () => {
    const { id } = router.query;
    if (isInitialized && id && user) {
      await getResult();
    }
  }, [isInitialized, user, router.query.id, chainId, devMode]);

  useEffect(() => {
    if (mintError) {
      toast({
        title: "Something went wrong",
        description: `An error occurred while claiming.`,
        status: "error",
        duration: 3000,
        position: "bottom-right",
      });
    } else if (minted && mintId) {
      toast({
        title: "NFT claimed!",
        description: `You are #${mintId} to earn this NFT!`,
        status: "success",
        duration: 3000,
        position: "bottom-right",
      });
    }
  }, [minted, mintId, mintError]);

  async function getResult() {
    try {
      const course = await getCourse();
      console.log("course:", course);
      const fromUser = course.attributes.responses.filter(
        (response) => response.id === router.query.entry
      );
      const questions = course.attributes.quiz.filter(
        (q) =>
          !!fromUser[fromUser.length - 1].answers.find((fu) => fu.id === q.id)
      );
      const userAnswers = fromUser[fromUser.length - 1].answers.map(
        (item) => item.answer
      );
      const actualAnswers = questions.map((item) => item.answer);
      const { match, total } = compareAnswers(userAnswers, actualAnswers);
      setScore({ correct: match, total: total });
      if (match / total >= minimumPassingPercentage) {
        const rewardNft = await getNFT(course.id);
        if (rewardNft) {
          const { address } = rewardNft.attributes;
          setMintable(await isMintable(address));
          setMintAddress(address);
        } else {
          setMintable(false);
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

  async function getNFT(courseId) {
    const currentChainId = devMode ? 80001 : 137;
    const RewardNFT = Moralis.Object.extend("RewardNFT");
    const query = new Moralis.Query(RewardNFT);
    query.equalTo("course", courseId);
    query.equalTo("chainId", currentChainId);
    const result = await query.first();
    return result;
  }

  async function isMintable(contractAddress) {
    if (user) {
      if (!Moralis.isWeb3Enabled()) await Moralis.enableWeb3();
      const provider = new providers.JsonRpcProvider(
        devMode ? process.env.AlchemyUrl_Dev : process.env.AlchemyUrl
      );
      const signer = provider.getSigner(user.attributes.ethAddress);
      const abi = new utils.Interface([
        "function claimed(address account) external view returns (bool)",
      ]);
      const contract = new Contract(contractAddress, abi, signer);
      const isClaimed = await contract.claimed(user.attributes.ethAddress);
      return !isClaimed;
    }
    return false;
  }

  async function mint() {
    setMintError(false);
    setMinted(false);
    setMintId(null);
    setMinting(true);
    try {
      if (!Moralis.isWeb3Enabled()) await Moralis.enableWeb3();
      const connectorType = Moralis.connectorType;
      let provider;
      if (connectorType === "injected") {
        if (
          (!devMode && chainId !== "0x89") ||
          (devMode && chainId !== "0x13881")
        ) {
          await switchNetwork();
        }
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        provider = new providers.Web3Provider(window.ethereum);
      } else {
        provider = new providers.JsonRpcProvider(
          devMode ? process.env.AlchemyUrl_Dev : process.env.AlchemyUrl
        );
      }
      const signer = provider.getSigner();
      const abi = new utils.Interface([
        "function mint() external",
        "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
      ]);
      const contract = new Contract(mintAddress, abi, provider);
      const tx = await contract.connect(signer).mint();
      await tx.wait();

      const tokenId = await contract.tokenOfOwnerByIndex(
        user.attributes.ethAddress,
        0
      );
      setMintId(tokenId);
      setMinted(true);
    } catch (error) {
      console.error(error);
      setMintError(true);
    }
    setMinting(false);
  }

  function compareAnswers(array1, array2) {
    const result = { match: 0, total: 0 };
    console.log("array1:", array1, "array2:", array2);
    for (let i = 0; array1.length > i && array2.length > i; i++) {
      if (array2.includes(array1[i])) {
        result.match++;
      }
    }
    result.total = array2.length;
    return result;
  }

  async function switchNetwork() {
    if (devMode) {
      await Moralis.switchNetwork("0x13881");
      if (chainId === "0x13881") {
        const chainId = 80001;
        const chainName = "Mumbai Testnet";
        const currencyName = "MATIC";
        const currencySymbol = "MATIC";
        const rpcUrl = "https://rpc-mumbai.maticvigil.com/";
        const blockExplorerUrl = "https://mumbai.polygonscan.com/";

        await Moralis.addNetwork(
          chainId,
          chainName,
          currencyName,
          currencySymbol,
          rpcUrl,
          blockExplorerUrl
        );
      }
    } else {
      await Moralis.switchNetwork("0x89");
      if (chainId === "0x89") {
        const chainId = 137;
        const chainName = "Polygon Mainnet";
        const currencyName = "MATIC";
        const currencySymbol = "MATIC";
        const rpcUrl = "https://polygon-rpc.com";
        const blockExplorerUrl = "https://polygonscan.com/";

        await Moralis.addNetwork(
          chainId,
          chainName,
          currencyName,
          currencySymbol,
          rpcUrl,
          blockExplorerUrl
        );
      }
    }
  }

  return (
    <Layout>
      <VStack
        textAlign="center"
        height="100%"
        bg={
          colorMode === "dark"
            ? "rgba(229, 229, 229, 0.13)"
            : "rgba(220, 220, 220, 1)"
        }
        padding={5}
        margin={5}
        minH="70vh"
        borderRadius={10}
        justify="center"
        align="center"
      >
        <Box>
          {passed && (
            <>
              {mintable && !minted && (
                <Confetti
                  recycle={false}
                  tweenDuration={100000}
                  numberOfPieces={1500}
                />
              )}
              <Heading marginBottom={5}>Congratulations! You passed!</Heading>
            </>
          )}
          <Heading size="md" marginBottom={5}>
            {score.correct}/{score.total} Correct
          </Heading>
          {passed ? (
            <Box>
              {!mintable ? (
                <NextLink href="/" passHref>
                  <Button mt={2}>Back to Home</Button>
                </NextLink>
              ) : (
                <>
                  <Text>
                    {mintId && minted
                      ? `You are #${mintId} to earn this NFT reward!`
                      : "You earned an NFT as a reward!"}
                  </Text>
                  <Flex direction="column" align="center" mt={4}>
                    <Button
                      backgroundColor="rgba(32, 223, 127, 1)"
                      _hover={{ backgroundColor: "rgba(32, 223, 127, 0.5)" }}
                      onClick={() =>
                        !minted
                          ? mint()
                          : router.push(
                              `https://${
                                devMode && "testnets."
                              }opensea.io/assets/${
                                devMode ? "mumbai" : "polygon"
                              }/${mintAddress}/${mintId}`
                            )
                      }
                      isLoading={minting}
                      loadingText="Claiming..."
                      minW={200}
                      size="lg"
                    >
                      {minted ? "View NFT earned" : "Claim"}
                    </Button>
                    {minted && (
                      <Button
                        as={Link}
                        leftIcon={<TwitterIcon />}
                        mt={6}
                        minW={150}
                        color="white"
                        backgroundColor="rgba(35, 35, 35, 1)"
                        _hover={{
                          textDecoration: "none",
                          backgroundColor: "rgba(35, 35, 35, 0.5)",
                        }}
                        isExternal
                        href="https://twitter.com/intent/tweet?hashtags=quiz%20%23ethereumquiz&amp;original_referer=https%3A%2F%2Fpublish.twitter.com%2F&amp;ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Eshare%7Ctwgr%5E&amp;text=I%20am%20excited%20to%20share%20that%20I%20took%20a%20quiz%20on%20%22ECH%20Learn2Earn%22%20and%20received%20an%20NFT.%20Try%20it%20today%20at%20&amp;url=https%3A%2F%2Fl2e.ethereumcatherders.com%2F%20&amp;via=EthCatHerders"
                      >
                        Share on Twitter
                      </Button>
                    )}
                    <NextLink href="/" passHref>
                      <Link textDecor="underline" mt={2}>
                        Back to Home
                      </Link>
                    </NextLink>
                  </Flex>
                </>
              )}
            </Box>
          ) : (
            <Box>
              <Text>Better luck next time :(</Text>
              <NextLink href="/" passHref>
                <Button mt={2}>Back to Home</Button>
              </NextLink>
            </Box>
          )}
        </Box>
      </VStack>
    </Layout>
  );
}
