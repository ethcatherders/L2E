import { Grid, GridItem, Container, Box, Text, Center, Heading } from '@chakra-ui/react';
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import pic from '../public/ECHLogo.png';

import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const { user, isInitialized } = useMoralis();
  
  useEffect(() => {
    if (isInitialized) {
      // Query courses from Moralis

      // This is just an example
      setCourses([{
        name: 'Course Name',
        thumbnail: pic,
        completed: false
      }])
    }
  }, [isInitialized]);

  return (
    <Layout>
      <Container maxW='container.xl' paddingTop={5} paddingBottom={5}>
        <Grid templateColumns={'repeat(auto-fit, minmax(250px, 1fr))'} gap={5}>
          {courses.map(course =>
            <GridItem bg='grey' borderRadius='md' maxWidth='350px' minHeight='fit-content' border='1px solid grey'>
              <Box maxWidth={'100%'}>
                <Image src={course.thumbnail} width={100} height={75} layout='responsive' objectFit='cover' />
              </Box>
              <Center padding={2} borderBottomRadius='md' height='75px' background='white'>
                <Heading size='md' noOfLines={1}>{course.name}</Heading>
              </Center>
            </GridItem>
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
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </Layout>
  )
}
