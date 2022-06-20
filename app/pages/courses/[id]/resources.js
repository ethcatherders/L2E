import { useEffect, useRef, useState } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from 'next/router';
import NextLink from "next/link";
import Layout from "../../../components/Layout";
import { 
  VStack,
  Box,
  Center,
  Spinner,
  Heading,
  Link,
  Text
} from "@chakra-ui/react";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false)
  const router = useRouter();

  const { isInitialized, Moralis, user } = useMoralis();

  useEffect(async () => {
    if (isInitialized && router.query.id) {
      setLoading(true)
      setResources(await getCourseResources());
      setLoading(false)
    }
  }, [isInitialized, !!router.query.id]);

  async function getCourseResources() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      return result.attributes.resources ? result.attributes.resources : []
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  return (
    <Layout>
      <Box background="rgba(229, 229, 229, 0.13)" padding={5}>
        {!loading ?
          <Box>
            <Heading size="md" mb={5}>Extra Resources</Heading>
            {resources.length ? resources.map((resource, index) => 
              <VStack key={index}>
                <Text>{resource.description}</Text>
                <Link>{resource.link}</Link>
              </VStack>
            ) : <Text>There are no additional resources for this course.</Text>}
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