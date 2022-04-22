import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from 'next/router';
import Layout from "../../../components/Layout";
import { 
  Box,
  Button,
  ButtonGroup,
  Center,
  Container, 
  Heading, 
  HStack, 
  Input, 
  Radio, 
  RadioGroup, 
  Text,
  VStack
} from "@chakra-ui/react";
import Link from "next/link";

/*
  An editable form to make changes to an existing course.
*/

export default function EditCourse() {
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isInitialized, Moralis } = useMoralis();
  const router = useRouter();

  useEffect(async () => {
    if (isInitialized) {
      await getCourse();
    }
  }, [isInitialized]);

  useEffect(async () => {
    const {id} = router.query;
    if (isInitialized && id) {
      await getCourse();
    }
  }, [router.query.id]);

  async function getCourse() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      console.log(result)
      return setCourse(result.attributes);
    } catch (error) {
      console.error(error);
    }
  }

  function changeTitle(newTitle) {
    const newCourse = {...course};
    newCourse.title = newTitle;
    setCourse(newCourse);
  }

  function changeVideoUrl(newVideoUrl) {
    const newCourse = {...course};
    newCourse.videoUrl = newVideoUrl;
    setCourse(newCourse);
  }

  function changeQuestion(index, newQuestion) {
    const newCourse = {...course};
    newCourse.quiz[index].question = newQuestion;
    setCourse(newCourse);
  }

  function changeAnswer(quizIndex, newAnswer) {
    const newCourse = {...course};
    newCourse.quiz[quizIndex].answer = newAnswer;
    setCourse(newCourse);
  }

  function changeOption(quizIndex, optIndex, newOption) {
    const newCourse = {...course};
    newCourse.quiz[quizIndex].options[optIndex] = newOption;
    setCourse(newCourse);
  }

  async function submitChanges(e) {
    e.preventDefault();

    setError(false);
    setSuccess(false);
    setLoading(true);

    // Upload changes to database
    try {
      const Course = Moralis.Object.extend("Course");
      const query = new Moralis.Query(Course);
      const { id } = router.query;

      const result = await query.get(id);
      await result.save(course);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(true);
    }

    setLoading(false);
  }

  return (
    <Layout>
      {course ? 
        <Container mb={20}>
          <HStack mt={5} mb={10} justifyContent="space-between">
            <Heading>Edit Course</Heading>
            <Link href={`/courses/${router.query.id}`} passHref>
              <Button>Go Back</Button>
            </Link>
          </HStack>
          <form onSubmit={submitChanges}>
            <VStack alignItems="flex-start" mb={5}>
              <Heading size="sm">Title:</Heading>
              <Input value={course.title} onChange={(e) => changeTitle(e.currentTarget.value)} />
            </VStack>
            <VStack alignItems="flex-start" mb={5}>
              <Heading size="sm">Video URL:</Heading>
              <Input value={course.videoUrl} onChange={(e) => changeVideoUrl(e.currentTarget.value)} />
            </VStack>
            <hr />
            <Heading mt={5} mb={5} size="md">Quiz</Heading>
            {course.quiz.map((quizItem, index) =>
              <Box mb={10} key={index}>
                <HStack>
                  <Heading size="sm">Q{quizItem.id}:</Heading>
                  <Input value={quizItem.question} onChange={(e) => changeQuestion(index, e.currentTarget.value)} />
                </HStack>
                <VStack alignItems="flex-start" mt={5}>
                  <Heading size="sm">Multiple Choice Options:</Heading>
                  <RadioGroup defaultValue={quizItem.answer}>
                    <VStack>
                    {quizItem.options.map((option, optIndex) =>
                      <HStack>
                        <Radio value={option} key={optIndex} onChange={(e) => changeAnswer(index, e.currentTarget.value)} />
                        <Input value={option} onChange={(e) => changeOption(index, optIndex, e.currentTarget.value)} />
                      </HStack>
                    )}
                    </VStack>
                  </RadioGroup>
                </VStack>
                <Heading size="sm" mt={5}>Answer: {quizItem.answer}</Heading>
              </Box>
            )}
            {error ? <Text color="red">Something went wrong.</Text> : ''}
            {success ? <Text color="green">Your changes have been saved!</Text> : ''}
            <ButtonGroup mt={5}>
              <Button type="submit" mr={2} isLoading={loading}>Save Changes</Button>
              <Button type="button" onClick={getCourse}>Reset</Button>
            </ButtonGroup>
          </form>
        </Container>
        :
        <Container>
          No Course Found
        </Container>
      }
    </Layout>
  )
}