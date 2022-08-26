import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from 'next/router';
import Layout from "../../components/Layout";
import {
  Container, 
  HStack, 
  VStack,
  Heading, 
  Text, 
  Button,
  Input, 
  FormControl, 
  FormLabel,
} from "@chakra-ui/react";
import Link from "next/link";

export default function CreatePoap() {
  const [poapData, setPoapData] = useState({
    name: '',
    adminLink: '',
    mintLinks: []
  });
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isInitialized, Moralis } = useMoralis();
  const router = useRouter();

  useEffect(async () => {
    if (isInitialized) {
      
    }
  }, [isInitialized]);

  function changeName(name) {
    const updatedPoapData = {...poapData};
    updatedPoapData.name = name;
    setPoapData(updatedPoapData);
  }

  function changeAdminLink(adminLink) {
    const updatedPoapData = {...poapData};
    updatedPoapData.adminLink = adminLink;
    setPoapData(updatedPoapData)
  }

  async function parseTxtFile() {
    setError(false)
    try {
      const fileList = document.getElementById('file').files;
      console.log("fileList: ", fileList);
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        console.log(e.target.result)
        const array = e.target.result.trim().split('\n');
        console.log(array);
        array.forEach(link => {
          if (typeof link !== 'string' || !link.includes('POAP.xyz')) {
            setError(true);
            throw console.error('Array contains at least 1 non-POAP mint link');
          }
        })
        const updatedPoapData = {...poapData};
        updatedPoapData.mintLinks = array;
        setPoapData(updatedPoapData);
      }
      fileReader.readAsText(fileList[0])
    } catch (error) {
      console.error(error);
    }
  }

  async function uploadPoapToMoralis() {
    if (!poapData.name || !poapData.adminLink || !poapData.mintLinks.length) {
      throw console.error('All input fields must be filled')
    }

    const Poap = Moralis.Object.extend("POAP");
    const poap = new Poap();
    await poap.save(poapData);
  }

  async function submitPoap(e) {
    e.preventDefault();

    setError(false);
    setSuccess(false);
    setLoading(true);

    // Upload POAP data to database
    try {
      await uploadPoapToMoralis();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(true);
    }
    setLoading(false);
  }

  return (
    <Layout>
      <Container mb={20}>
        <HStack mt={5} mb={10} justifyContent="space-between">
          <Heading>Add a New POAP</Heading>
          <Link href={`/poaps`} passHref>
            <Button>Back to POAPs</Button>
          </Link>
        </HStack>
        <form onSubmit={submitPoap}>
          <VStack alignItems="flex-start" mb={5}>
            <Heading size="sm">Name:</Heading>
            <Input value={poapData.name} onChange={(e) => changeName(e.currentTarget.value)} />
          </VStack>
          <VStack alignItems="flex-start" mb={5}>
            <Heading size="sm">Admin Page URL:</Heading>
            <Input value={poapData.adminLink} onChange={(e) => changeAdminLink(e.currentTarget.value)} />
          </VStack>
          <FormControl>
            <FormLabel>Upload the .txt file of mint links here:</FormLabel>
            <Input type='file' id="file" name="upload" accept=".txt" onChange={parseTxtFile} />
        </FormControl>
          {error ? <Text color="red">Something went wrong.</Text> : ''}
          {success ? <Text color="green">Your POAP has been saved!</Text> : ''}
          <Button type="submit" mt={5} isLoading={loading}>Save</Button>
        </form>
      </Container>
    </Layout>
  )
}