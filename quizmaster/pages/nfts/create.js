import { useEffect, useState, useContext } from "react";
import { useMoralis } from "react-moralis";
import Layout from "../../components/Layout";
import {
  Container, 
  HStack, 
  VStack,
  Heading, 
  Text, 
  Button,
  Input,
  Textarea,
  Select,
  Image,
  Spinner
} from "@chakra-ui/react";
import Link from "next/link";
import { utils, Contract, ethers } from "ethers";
import { FactoryAddresses } from "../../utils/factory";
import { AdminContext } from "../../context/AdminContext";

export default function CreateNFT() {
  const { devMode } = useContext(AdminContext)
  // Form State Variables
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("L2E");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [course, setCourse] = useState(null);
  // Query States
  const [availableCourses, setAvailableCourses] = useState([]);
  // Status States
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [FactoryInfo, setFactoryInfo] = useState(devMode ? FactoryAddresses.dev : FactoryAddresses.prod)

  const { isInitialized, Moralis, user } = useMoralis();

  useEffect(async () => {
    if (isInitialized) {
      await getAvailableCourses()
    }
  }, [isInitialized, devMode]);

  useEffect(() => {
    if (devMode) {
      setFactoryInfo(FactoryAddresses.dev)
    } else {
      setFactoryInfo(FactoryAddresses.prod)
    }
  }, [devMode]);

  async function getAllNFTs() {
    try {
      const RewardNFT = Moralis.Object.extend("RewardNFT")
      const query = new Moralis.Query(RewardNFT)
      return await query.filter(reward => !!reward.attributes.course)
    } catch (error) {
      console.error(error)
    }
  }

  async function getAllCourses() {
    try {
      const Course = Moralis.Object.extend("Course");
      const query = new Moralis.Query(Course);
      const results = await query.find();
      return results
    } catch (error) {
      console.error(error)
    }
  }

  async function getAvailableCourses() {
    const courses = await getAllCourses()
    const nfts = await getAllNFTs()
    const filtered = courses.filter(course => !nfts.find(token => (token.attributes.course === course.id) && (devMode ? token.attributes.chainId === 80001 : token.attributes.chainId === 137)))
    setAvailableCourses(filtered)
  }

  async function uploadImage(newImage) {
    setUploading(true)
    try {
      const file = new Moralis.File(newImage.name, newImage)
      await file.saveIPFS()

      const cid = file.hash();
      setImage(`ipfs://${cid}`)

      console.log("Image IPFS Hash:", cid)
    } catch (error) {
      console.error(error)      
    }
    setUploading(false)
  }

  async function addNFTToMoralis(address, chainId) {
    if (!name || !image || !symbol || !description || !owner || !course) {
      throw console.error('All input fields must be filled')
    }

    if (!address || !chainId) {
      throw console.error('Missing NFT contract info')
    }

    const RewardNFT = Moralis.Object.extend("RewardNFT");
    const reward = new RewardNFT();
    await reward.save({
      name,
      symbol,
      image,
      description,
      owner,
      course,
      address,
      chainId
    });
  }

  async function uploadMetadata() {
    if (!name || !image || !symbol || !description) {
      throw console.error("Missing metadata param")
    }

    const metadata = {
      name,
      image,
      description
    }

    // Upload using NFT.Storage?
    const file = new Moralis.File("file.json", {
      base64: Buffer.from(JSON.stringify(metadata)).toString('base64'),
    });
    await file.saveIPFS();
    console.log("IPFS Upload:", file.hash())
    return `ipfs://${file.hash()}`
  }

  async function deployContract(tokenURI) {
    const provider = window.ethereum ?
      new ethers.providers.Web3Provider(window.ethereum) :
      new ethers.providers.JsonRpcProvider(FactoryInfo.provider)
    const signer = provider.getSigner(user.attributes.ethAddress)
    const abi = new utils.Interface([
      'function create(string name, string symbol, string baseURI, address assignedOwner) public override returns (address)',
    ])
    const factory = new Contract(
      FactoryInfo.address,
      abi,
      signer
    )
    // Deploy contract and parse event to get new contract address
    const tx = await factory.create(name, symbol, tokenURI, owner)
    const receipt = await tx.wait()
    console.log(receipt)
    return await getNFTContractAddress(receipt)
  }

  async function getNFTContractAddress(receipt) {
    if (!receipt || !receipt.logs) return "";
    const abi = new utils.Interface([
      "event CreateReward(uint256 indexed index, address contractAddress, address assignedOwner, address creator);",
    ]);
    const eventFragment = abi.events[Object.keys(abi.events)[0]];
    const eventTopic = abi.getEventTopic(eventFragment);
    const event = receipt.logs.find(e => e.topics[0] === eventTopic);
    if (event) {
      const decodedLog = abi.decodeEventLog(
        eventFragment,
        event.data,
        event.topics,
      );
      return decodedLog.contractAddress;
    }
    return "";
  };

  async function submitNFTCreation() {
    setError(false);
    setSuccess(false);
    setLoading(true);
    try {
      const baseURI = await uploadMetadata()
      const contractAddress = await deployContract(baseURI)
      const chainId = FactoryInfo.chainId
      await addNFTToMoralis(contractAddress, chainId)
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setError(true);
    }
    setLoading(false);
  }

  async function setValues(courseId) {
    setCourse(courseId)
    const course = availableCourses.find(course => course.id === courseId);
    const title = course.attributes.title
    setName(`Learn2Earn Badge for ${title}`)
    setSymbol('L2E')
    setDescription(`A badge rewarded to those who completed the course and quiz with 100% accuracy on Ethereum Cat Herder's Learn2Earn platform for the following topic, ${title}.`)
  }

  return (
    <Layout>
      <Container mb={20}>
        <HStack mt={5} mb={10} justifyContent="space-between">
          <Heading>Create a New NFT</Heading>
          <Link href={`/nfts`} passHref>
            <Button color='white' backgroundColor='black'>Back to NFTs</Button>
          </Link>
        </HStack>
        <Text mb={5}>Deploy a new NFT contract for users to mint from after passing 100% on a particular course quiz.</Text>
        <VStack alignItems="flex-start" mb={5}>
          <Heading size="sm">Course:</Heading>
          <Select placeholder="Select a course" onChange={(e) => setValues(e.currentTarget.value)} isRequired={true}>
            {availableCourses.map((course) => (
              <option key={course.id} value={course.id}>{course.attributes.title}</option>
            ))}
          </Select>
        </VStack>
        <VStack alignItems="flex-start" mb={5}>
          <Heading size="sm">Name:</Heading>
          <Input value={name} onChange={(e) => setName(e.currentTarget.value)} isRequired={true} />
        </VStack>
        <VStack alignItems="flex-start" mb={5}>
          <Heading size="sm">Symbol:</Heading>
          <Input value={symbol} onChange={(e) => setSymbol(e.currentTarget.value)} isRequired={true} isDisabled={true} />
        </VStack>
        <VStack alignItems="flex-start" mb={5}>
          <Heading size="sm">Description:</Heading>
          <Textarea
            size="sm"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            placeholder="Add a brief description of its purpose"
            isRequired={true}
          />
        </VStack>
        <VStack alignItems="flex-start" mb={5}>
          <Heading size="sm">Owner Address:</Heading>
          <Input value={owner} onChange={(e) => setOwner(e.currentTarget.value)} isRequired={true} />
        </VStack>
        <HStack mb={5} width='100%' gap={2}>
          <VStack alignItems="flex-start" flexGrow={1}>
            <Heading size="sm">Upload Image:</Heading>
            <Input onChange={(e) => uploadImage(e.currentTarget.files[0])} type='file' isRequired={true} />
          </VStack>
          <Image
            src={image && `https://gateway.moralisipfs.com/ipfs/${image.substring(7)}`} 
            width={100} 
            height={100} 
            objectFit='cover' 
            borderRadius={10}
            fallback={uploading && <Spinner width={100} height={100} />}
          />
        </HStack>
        {error && <Text color="red">Something went wrong.</Text>}
        {success ? (
          <Text color="green">Your NFT contract has been successfully created!</Text>
        ) : (
          <Button
            type="button"
            mt={5}
            color='white'
            backgroundColor='black'
            onClick={submitNFTCreation}
            isLoading={loading}
            isDisabled={!name||!image||!symbol||!description||!owner||!course}
          >
            Deploy to {devMode ? 'Mumbai Testnet' : 'Polygon Mainnet'}
          </Button>
        )}
        
      </Container>
    </Layout>
  )
}