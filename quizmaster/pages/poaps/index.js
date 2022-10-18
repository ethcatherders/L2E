import { useEffect, useRef, useState } from "react";
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

export default function PoapsEarned() {
  const [loading, setLoading] = useState(true)
  const [poaps, setPoaps] = useState([]);
  const [courses, setCourses] = useState([])
  const [openAssignForm, setOpenAssignForm] = useState([])
  const [openRefillForm, setOpenRefillForm] = useState([])
  const [refillLinks, setRefillLinks] = useState([])
  const [refillErrors, setRefillErrors] = useState([])
  const [isRefilling, setIsRefilling] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { isInitialized, Moralis } = useMoralis();
  
  useEffect(async () => {
    if (isInitialized) {
      await getAllPoaps()
      await getAllCourses()
      setLoading(false)
    }
  }, [isInitialized]);

  // Query user's profile to get POAPs earned
  async function getAllPoaps() {
    try {
      const POAP = Moralis.Object.extend("POAP")
      const query = new Moralis.Query(POAP)
      const results = await query.find()
      const parsed = await Promise.all(results.map(async (poap) => {
        if (poap.attributes.course) {
          const course = await getCourse(poap.attributes.course.id)
          return {
            id: poap.id,
            image: poap.attributes.image,
            name: poap.attributes.name,
            mintLinks: poap.attributes.mintLinks,
            adminLink: poap.attributes.adminLink,
            course: {
              id: course.id,
              ...course.attributes
            },
            createdAt: poap.createdAt,
            updatedAt: poap.updatedAt
          }
        }
        return {
          id: poap.id,
          image: poap.attributes.image,
          name: poap.attributes.name,
          mintLinks: poap.attributes.mintLinks,
          adminLink: poap.attributes.adminLink,
          course: undefined,
          createdAt: poap.createdAt,
          updatedAt: poap.updatedAt
        }
      }))
      setPoaps(parsed)
      setOpenAssignForm(parsed.map(() => false))
      setOpenRefillForm(parsed.map(() => false))
      setRefillLinks(parsed.map(() => []))
      setRefillErrors(parsed.map(() => false))
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

  async function assignPoapToCourse(index) {
    try {
      const inputValue = document.getElementById(`course-assign-input-${index}`).value
      const Course = Moralis.Object.extend("Course");
      const cQuery = new Moralis.Query(Course);
      const course = await cQuery.get(inputValue)
      
      const POAP = Moralis.Object.extend("POAP")
      const pQuery = new Moralis.Query(POAP)
      const poap = await pQuery.get(poaps[index].id)

      poap.set("course", course)
      await poap.save()
      console.log('Assigned new course to POAP!')

      await getAllPoaps()
    } catch (error) {
      console.error(error)
    }
  }

  async function refillPoaps(index) {
    setIsRefilling(true)
    try {
      const POAP = Moralis.Object.extend("POAP")
      const pQuery = new Moralis.Query(POAP)
      const poap = await pQuery.get(poaps[index].id)
      const links = refillLinks[index]

      poap.addAll("mintLinks", links)
      await poap.save()
      console.log('Refilled POAP with new links!')

      await getAllPoaps()
    } catch (error) {
      console.error(error)
    }
    setIsRefilling(false)
  }

  async function parseTxtFile(index) {
    refillErrors[index] = false
    setRefillErrors([...refillErrors])
    try {
      const fileList = document.getElementById(`refill-upload-${index}`).files;
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
        const refills = [...refillLinks]
        refills[index] = array
        setRefillLinks(refills)
      }
      fileReader.readAsText(fileList[0])
    } catch (error) {
      console.error(error);
      refillErrors[index] = true
      setRefillErrors([...refillErrors])
    }
  }

  async function uploadImageToPoap(index, newImage) {
    setUploading(true)
    try {
      const POAP = Moralis.Object.extend("POAP")
      const pQuery = new Moralis.Query(POAP)
      const poap = await pQuery.get(poaps[index].id)

      const file = new Moralis.File(newImage.name, newImage)
      await file.saveIPFS()
      const image = file.hash();
      
      await poap.save({ image })
      console.log('Image uploaded!')

      poaps[index].image = image
      setPoaps([...poaps])
    } catch (error) {
      console.error(error)
    }
    setUploading(false)
  }

  return (
    <Layout>
      <Box background="rgba(229, 229, 229, 0.13)" padding={5} mt={2}>
        <HStack justify='space-between' align='center' mb={5}>
          <Heading>POAPs</Heading>
          <NextLink href='/poaps/create' passHref>
            <Button color='white' backgroundColor='black'>+ Import</Button>
          </NextLink>
        </HStack>
        {!loading ?
          <Box>
            {poaps.length ? poaps.map((poap, index) => 
              <HStack gap={5} key={index} mb={5}>
                <FormControl maxWidth='fit-content'>
                  <FormLabel htmlFor={`upload-${poap.id}`}>
                    <Image
                      src={poap.image && `https://gateway.moralisipfs.com/ipfs/${poap.image}`}
                      width={100}
                      height={100}
                      borderRadius='full'
                      objectFit='cover'
                      fallback={uploading && <Spinner width={100} height={100} />}
                    />
                  </FormLabel>
                  <Input
                    id={`upload-${poap.id}`}
                    type='file'
                    onChange={(e) => uploadImageToPoap(index, e.currentTarget.files[0])}
                    hidden
                  />
                </FormControl>
                <VStack align='left'>
                  <Heading size='md'>{poap.name}</Heading>
                  <Text>
                    {poap.mintLinks.length} Remaining <Link onClick={() => {
                        openRefillForm[index] = !openRefillForm[index]
                        setOpenRefillForm([...openRefillForm])
                      }}
                    >
                      ({openRefillForm[index] ? 'cancel' : 'refill'})
                    </Link>
                  </Text>
                  {openRefillForm[index] && (
                    <Box>
                      <HStack align="flex-end" paddingLeft={4}>
                        <FormControl>
                          <FormLabel>Upload the .txt file of mint links here:</FormLabel>
                          <Input type='file' id={`refill-upload-${index}`} name="upload" accept=".txt" onChange={() => parseTxtFile(index)} />
                        </FormControl>
                        <Button onClick={() => refillPoaps(index)} color='white' backgroundColor='black' isLoading={isRefilling}>Submit</Button>
                      </HStack>
                      {refillErrors[index] && <Text color="red">Something went wrong.</Text>}
                    </Box>
                  )}
                  <Text>Admin Access: {poap.adminLink}</Text>
                  <Text>Assigned to: {poap.course ? (
                    <NextLink href={`/courses/${poap.course.id}`} passHref>
                      <Link textDecor='underline'>{poap.course.title}</Link>
                    </NextLink>
                  ) : 'None'} <Link onClick={() => {
                        openAssignForm[index] = !openAssignForm[index]
                        setOpenAssignForm([...openAssignForm])
                      }}
                    >
                      ({openAssignForm[index] ? 'cancel' : 'change'})
                    </Link>
                  </Text>
                  {openAssignForm[index] && (
                    <HStack paddingLeft={4}>
                      <Select id={`course-assign-input-${index}`}>
                        {courses.map((course) => (
                          <option value={course.id} key={course.id}>{course.title}</option>
                        ))}
                      </Select>
                      <Button onClick={() => assignPoapToCourse(index)} color='white' backgroundColor='black'>Submit</Button>
                    </HStack>
                  )}
                </VStack>
              </HStack>
            ) : <Text>No POAPs were found.</Text>}
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