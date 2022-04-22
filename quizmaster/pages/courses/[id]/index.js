import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Container, AspectRatio, Box, Text, Button, Center, Heading, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from "next/link";

import Layout from "../../../components/Layout";

export default function Course() {
  const [course, setCourse] = useState(null);
  const { isInitialized, Moralis } = useMoralis();
  const router = useRouter();

  useEffect(async () => {
    if (isInitialized) {
      setCourse(await getCourse());
    }
  }, [isInitialized]);

  useEffect(async () => {
    const {id} = router.query;
    if (isInitialized && id) {
      setCourse(await getCourse());
    }
  }, [router.query.id]);

  async function getCourse() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      console.log(result)
      return result;
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Layout>
      {course ? 
        <Container maxW='container.md' paddingTop={5}>
          <HStack paddingBottom={5} justifyContent="space-between">
            <Heading>
              {course.attributes.title}
            </Heading>
            <HStack>
              <Link href={`/courses/${router.query.id}/edit`} passHref>
                <Button>Edit Course</Button>
              </Link>
              <Link href={`/courses/${router.query.id}/poap`} passHref>
                <Button>Add/Change POAP</Button>
              </Link>
            </HStack>
          </HStack>
          <Heading size="md" marginTop={5} marginBottom={2}>Video</Heading>
          <AspectRatio height={450} width={'100%'}>
            <iframe width="560" height="315" src={course.attributes.videoUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </AspectRatio>
          <Heading size="md" marginTop={5} marginBottom={2}>Quiz</Heading>
          {course.attributes.quiz.map((quizItem, index) => 
            <Box border="1px solid grey" padding="10px" borderRadius="5px" marginBottom={2} key={index}>
              <Heading size="sm">Q: {quizItem.question}</Heading>
              <Text marginLeft={5}>- {quizItem.options[0]}</Text>
              <Text marginLeft={5}>- {quizItem.options[1]}</Text>
              <Text marginLeft={5}>- {quizItem.options[2]}</Text>
              <Text marginLeft={5}>- {quizItem.options[3]}</Text>
              <Text>A: {quizItem.answer}</Text>
            </Box>
          )}
        </Container>
        :
        <Container>
          No Course Found
        </Container>
      }
    </Layout>
  )
}