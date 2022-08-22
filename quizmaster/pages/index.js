import { Grid, HStack, GridItem, Container, Box, Text, Center, Heading, Image, AspectRatio, Flex, Skeleton, Circle, Avatar, Button } from '@chakra-ui/react';
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
      } else if (course.attributes.thumbnail) {
        thumbnailUrl = course.attributes.thumbnail
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
        <HStack mb={5}>
          <Heading>Courses</Heading>
          <NextLink href="/courses/create">
            <Button>+ New Course</Button>
          </NextLink>
        </HStack>
        <Grid templateColumns={'repeat(auto-fit, minmax(200px, 1fr))'} gap={5}>
          {courses.map((course, index) =>
            <NextLink href={`/courses/${course.id}`} key={index}>
              <GridItem
                // display='flex'
                // flexDir='column'
                bg="rgba(36, 39, 48, 1)"
                borderRadius='2xl'
                maxWidth='350px'
                minHeight='fit-content'
                border='1px solid grey'
                cursor='pointer'
                overflow='hidden'
              >
                <Flex width='100%' justify='end'>
                  <Text
                    position='fixed'
                    textAlign='right'
                    paddingX={2}
                    paddingY={0.25}
                    borderRadius={10}
                    background={'rgba(0,0,0,0.8)'}
                    color={'white'}
                    mr={2}
                    mt={2}
                    zIndex={1}
                  >
                    {course.duration ?? '-- min'}
                  </Text>
                </Flex>
                {course.thumbnail === pic ? (
                  <Image
                    src={course.thumbnail}
                    objectFit='cover'
                  />
                ) : (
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
                )}
                <Flex
                  direction='column'
                  // justify='center'
                  align='end'
                  padding={4}
                  borderBottomRadius='2xl'
                  minHeight={100}
                  zIndex={1}
                  bg={"rgba(36, 39, 48, 1)"}
                >
                  <Circle
                    position='absolute'
                    mt={-10}
                    border='1px solid grey'
                    padding={1}
                  >
                    <Avatar
                      src={course.speakerImg}
                      height={50}
                      width={50}
                    />
                  </Circle>
                  <Heading
                    size='xs'
                    noOfLines={1}
                    alignSelf='start'
                    color={'rgba(183, 185, 210, 1)'}
                  >
                    {course.speaker ?? 'Unknown'}
                  </Heading>
                  <Heading
                    size='sm'
                    noOfLines={3}
                    alignSelf='start'
                    mt={2}
                  >
                    {course.title}
                  </Heading>
                </Flex>
              </GridItem>
            </NextLink>
          )}
        </Grid>
      </Container>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <NextImage src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </Layout>
  )
}
