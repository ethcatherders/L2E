import { useEffect, useRef, useState, useContext } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from 'next/router';
import NextLink from "next/link";
import Layout from "../../components/Layout";
import { 
  VStack,
  Box,
  Center,
  Spinner,
  Heading,
  Link,
  Text,
  HStack,
  Image,
  Button,
  Select,
  FormControl,
  FormLabel,
  Input
} from "@chakra-ui/react";
import { AdminContext } from "../../context/AdminContext";
import { FactoryAddresses } from "../../utils/factory";

export default function NFTManager() {
  const { devMode } = useContext(AdminContext)
  const [loading, setLoading] = useState(true)
  const [poaps, setPoaps] = useState([]);
  const [nfts, setNFTs] = useState([]);
  const [courses, setCourses] = useState([])
  const [openForm, setOpenForm] = useState([])
  const [uploading, setUploading] = useState(false)
  const [FactoryInfo, setFactoryInfo] = useState(devMode ? FactoryAddresses.dev : FactoryAddresses.prod)

  const { isInitialized, Moralis } = useMoralis();
  
  useEffect(async () => {
    if (isInitialized) {
      await getAllNFTs()
      await getAllCourses()
      setLoading(false)
    }
  }, [isInitialized]);

  async function getAllNFTs() {
    try {
      const RewardNFT = Moralis.Object.extend("RewardNFT")
      const query = new Moralis.Query(RewardNFT)
      const results = await query.find()
      const parsed = await Promise.all(results.map(async (reward) => {
        if (reward.attributes.course) {
          const course = await getCourse(reward.attributes.course.id)
          return {
            id: reward.id,
            address: reward.attributes.address,
            chainId: reward.attributes.chainId,
            image: reward.attributes.image,
            name: reward.attributes.name,
            owner: reward.attributes.owner,
            course: {
              id: course.id,
              ...course.attributes
            },
            createdAt: reward.createdAt,
            updatedAt: reward.updatedAt
          }
        }
        return {
          id: reward.id,
          address: reward.attributes.address,
          chainId: reward.attributes.chainId,
          image: reward.attributes.image,
          name: reward.attributes.name,
          owner: reward.attributes.owner,
          course: undefined,
          createdAt: reward.createdAt,
          updatedAt: reward.updatedAt
        }
      }))
      setNFTs(parsed)
      setOpenForm(parsed.map(() => false))
    } catch (error) {
      console.error(error)
    }
  }

  async function getCourse(id) {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);

    try {
      const result = await query.get(id);
      console.log(result)
      return result;
    } catch (error) {
      console.error(error);
    }
  }

  async function getAllCourses() {
    try {
      const Course = Moralis.Object.extend("Course");
      const query = new Moralis.Query(Course);
      const results = await query.map(course => {
        return {
          id: course.id,
          title: course.attributes.title
        }
      });
      setCourses(results);
    } catch (error) {
      console.error(error)
    }
  }

  async function assignCourseToNFT(index) {
    try {
      const inputValue = document.getElementById(`course-assign-input-${index}`).value
      const Course = Moralis.Object.extend("Course");
      const cQuery = new Moralis.Query(Course);
      const course = await cQuery.get(inputValue)
      
      const RewardNFT = Moralis.Object.extend("RewardNFT")
      const pQuery = new Moralis.Query(RewardNFT)
      const nft = await pQuery.get(nfts[index].id)

      nft.set("course", course)
      await nft.save()
      console.log('Assigned new course to POAP!')

      await getAllNFTs()
    } catch (error) {
      console.error(error)
    }
  }

  async function uploadPreviewImageToNFT(index, newImage) {
    setUploading(true)
    try {
      const RewardNFT = Moralis.Object.extend("RewardNFT")
      const pQuery = new Moralis.Query(RewardNFT)
      const reward = await pQuery.get(nfts[index].id)

      const file = new Moralis.File(newImage.name, newImage)
      await file.saveIPFS()
      const image = file.hash();
      
      await reward.save({ image })
      console.log('Image uploaded!')

      nfts[index].image = image
      setNFTs([...nfts])
    } catch (error) {
      console.error(error)
    }
    setUploading(false)
  }

  return (
    <Layout>
      <Box background="rgba(229, 229, 229, 0.13)" padding={5} mt={2}>
        <HStack justify='space-between' align='center' mb={5}>
          <Heading>NFTs</Heading>
          <NextLink href='/nfts/create' passHref>
            <Button color='white' backgroundColor='black'>+ Create</Button>
          </NextLink>
        </HStack>
        {!loading ?
          <Box>
            {nfts.length ? nfts.map((token, index) => 
              <HStack gap={5} key={index} mb={5}>
                <FormControl maxWidth='fit-content'>
                  <FormLabel htmlFor={`upload-${token.id}`}>
                    <Image
                      src={token.image && `https://gateway.moralisipfs.com/ipfs/${token.image}`}
                      width={100}
                      height={100}
                      borderRadius='full'
                      objectFit='cover'
                      fallback={uploading && <Spinner width={100} height={100} />}
                    />
                  </FormLabel>
                  <Input
                    id={`upload-${token.id}`}
                    type='file'
                    onChange={(e) => uploadPreviewImageToNFT(index, e.currentTarget.files[0])}
                    hidden
                  />
                </FormControl>
                <VStack align='left'>
                  <Heading size='md'>{token.name}</Heading>
                  <Text>{token.mintLinks.length} Remaining</Text>
                  <Text>Admin Access: {token.adminLink}</Text>
                  <Text>Assigned to: {token.course ? (
                    <NextLink href={`/courses/${token.course.id}`} passHref>
                      <Link textDecor='underline'>{token.course.title}</Link>
                    </NextLink>
                  ) : 'None'} <Link onClick={() => {
                        openForm[index] = !openForm[index]
                        setOpenForm([...openForm])
                      }}
                    >
                      ({openForm[index] ? 'cancel' : 'change'})
                    </Link>
                  </Text>
                  {openForm[index] && (
                    <HStack>
                      <Select id={`course-assign-input-${index}`}>
                        {courses.map((course) => (
                          <option value={course.id} key={course.id}>{course.title}</option>
                        ))}
                      </Select>
                      <Button onClick={() => assignCourseToNFT(index)} color='white' backgroundColor='black'>Submit</Button>
                    </HStack>
                  )}
                </VStack>
              </HStack>
            ) : <Text>No NFTs were found.</Text>}
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