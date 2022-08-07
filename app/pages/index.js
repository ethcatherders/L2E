import { Grid, GridItem, Container, Box, Text, Center, Heading, Image, AspectRatio, Flex, Skeleton, useColorMode } from '@chakra-ui/react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import styles from '../styles/Home.module.css';
import pic from '../public/ECHLogo.png';

import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const { user, isInitialized, Moralis } = useMoralis();
  const { colorMode } = useColorMode()
  
  useEffect(async () => {
    if (isInitialized) {
      // Query courses from Moralis
      await getCourses();
    }
  }, [isInitialized]);

  async function getCourses() {
    // This will need to be transitioned to a Cloud function when filtering between completed and not completed by user
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const results = await query.map(course => {
      let thumbnailUrl
      if (course.attributes.videoUrl) {
        const startIndex = "https://www.youtube.com/embed/".length
        thumbnailUrl = `http://img.youtube.com/vi/${course.attributes.videoUrl.substring(startIndex)}/maxresdefault.jpg`
      }
      return {
        id: course.id,
        title: course.attributes.title,
        thumbnail: thumbnailUrl ? thumbnailUrl : pic,
        completed: false
      }
    });
    setCourses(results);
  }

  return (
    <Layout>
      <Container maxW='container.xl' paddingTop={5} paddingBottom={5}>
        {courses.length ?
          <NextLink href={`/courses/${courses[0].id}`}>
            <Flex justify='center' align='center' id='showcase' mb={10} borderRadius="2xl" width="100%" height={250} border="1px solid grey" cursor="pointer" overflow='hidden'>
              <Center
                zIndex={1}
                position='absolute'
              >
                <Heading size='xl' noOfLines={1}>{courses[0].title}</Heading>
              </Center>
              <Image
                src={courses[0].thumbnail}
                fallback={<Skeleton height={250} width='100%' />}
                position='relative'
                objectFit='cover'
                height={250}
                width='100%'
                transition='all .5s ease'
                overflow='hidden'
                borderRadius="2xl"
                _hover={{ transform: 'scale(1.2)' }}
              />
            </Flex>
          </NextLink>
          :
          ""
        }
        <Grid templateColumns={'repeat(auto-fit, minmax(200px, 1fr))'} gap={5}>
          {courses.slice(1).map((course, index) =>
            <NextLink href={`/courses/${course.id}`} key={index}>
              <GridItem bg="rgba(36, 39, 48, 1)" borderRadius='2xl' maxWidth='350px' minHeight='fit-content' border='1px solid grey' cursor='pointer' overflow='hidden'>
                <AspectRatio overflow='hidden' borderTopRadius='2xl' ratio={1.75}>
                  <Image
                    src={course.thumbnail}
                    fallback={<Skeleton width='100%' height='100%' />}
                    objectFit='cover'
                    transition='all .5s ease'
                    _hover={{ transform: 'scale(1.2)' }}
                    zIndex={0}
                  />
                </AspectRatio>
                <Flex
                  direction='column'
                  justify='center'
                  padding={4}
                  borderBottomRadius='2xl'
                  height={100}
                  zIndex={1}
                  bg={colorMode === 'dark' ? "rgba(36, 39, 48, 1)" : "rgba(196, 196, 196, 1)"}
                >
                  <Heading size='sm' noOfLines={3}>{course.title}</Heading>
                </Flex>
              </GridItem>
            </NextLink>
          )}
        </Grid>
      </Container>
    </Layout>
  )
}
