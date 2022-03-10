import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Container, AspectRatio, Button, Center, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from "next/link";

import Layout from "../../../components/Layout";

export default function Course() {
  const [course, setCourse] = useState(null);
  const { isInitialized, Moralis } = useMoralis();
  const router = useRouter();
  console.log(router.pathname);

  useEffect(async () => {
    if (isInitialized) {
      setCourse(await getCourse());
    }
  }, [isInitialized]);

  async function getCourse() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      return {
        title: result.attributes.title,
        videoUrl: result.attributes.videoUrl
      }
    } catch (error) {
      console.error(error);
      return {
        title: 'Example',
        videoUrl: 'https://youtu.be/dQw4w9WgXcQ'
      }
    }
  }

  return (
    <Layout>
      {course ? 
        <Container maxW='container.md' paddingTop={5}>
          <Heading textAlign='center' paddingBottom={5}>
            {course.title}
          </Heading>
          <AspectRatio height={450} width={'100%'}>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </AspectRatio>
          <Center paddingTop={5}>
            <Link href={`/courses/${router.query.id}/questions`}>
              <Button>
                Take Quiz
              </Button>
            </Link>
          </Center>
        </Container>
        :
        <Container>
          No Course Found
        </Container>
      }
    </Layout>
  )
}