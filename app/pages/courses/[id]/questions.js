import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from 'next/router';
import Link from "next/link";
import Layout from "../../../components/Layout";
import { 
  Container, 
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  RadioGroup,
  Radio,
  VStack,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner
} from "@chakra-ui/react";

export default function Questions() {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isInitialized, Moralis, user } = useMoralis();
  const router = useRouter();

  useEffect(async () => {
    if (isInitialized) {
      setQuiz(await getCourseQuestions());
      setAnswers(Array(quiz.length));
    }
  }, [isInitialized]);

  useEffect(async () => {
    const { id } = router.query;
    if (isInitialized && id) {
      setQuiz(await getCourseQuestions());
      setAnswers(Array(quiz.length));
    }
  }, [router.query.id]);

  async function getCourseQuestions() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      return result.attributes.quiz.map(item => {
        return {
          id: item.id,
          question: item.question,
          options: item.options
        }
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function selectAnswer(e, quizIndex) {
    answers[quizIndex] = e;
    setAnswers([...answers]);
  }

  async function submit(e) {
    e.preventDefault();
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      const userId = user.id;
      result.addUnique("responses", { user: userId, answers });
      await result.save();
      user.addUnique("coursesCompleted", result);
      await user.save();
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Layout>
      {!user ? 
        <Container padding={10}>
          <Alert 
            status="error"
            flexDirection='column'
            alignItems='center'
            textAlign='center'
            padding={5}
            minWidth='100%'
          >
            <AlertIcon boxSize='30px' />
            <AlertTitle mt={5}>Connect your wallet!</AlertTitle>
            <AlertDescription>You must connect and sign-in with your Ethereum address before continuing.</AlertDescription>
          </Alert>
        </Container>
        :
        <Container padding={10}>
          {!isSubmitted ?
            <Box>
              {quiz.length ?
                <form onSubmit={submit}>
                  {quiz.map((quizItem, index) => 
                    <FormControl as='fieldset' isRequired key={index} paddingBottom={10} disabled={user ? false : true}>
                      <FormLabel as='legend'>{quizItem.question}</FormLabel>
                      <RadioGroup paddingLeft={5} value={answers[index]} onChange={(e) => selectAnswer(e, index)}>
                        <VStack alignItems='flex-start'>
                          {quizItem.options.map((option, optIndex) =>
                            <Radio value={option} key={optIndex}>{option}</Radio>
                          )}
                        </VStack>
                      </RadioGroup>
                    </FormControl>
                  )}
                  <Button type="submit">
                    Submit
                  </Button>
                </form>
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
            :
            <Box>
              <Alert
                status='success'
                variant='subtle'
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                textAlign='center'
                height='200px'
                borderRadius={5}
                marginBottom={5}
                >
                <AlertIcon boxSize='40px' mr={0} />
                <AlertTitle mt={4} mb={1} fontSize='lg'>
                  Your Answers Submitted!
                </AlertTitle>
                <AlertDescription maxWidth='sm'>
                  Click on 'View Results' to see your score and potentially earn a POAP!
                </AlertDescription>
              </Alert>
              <Center>
                <Link href={`/courses/${router.query.id}/results`}>
                  <Button type="button">
                    View Results
                  </Button>
                </Link>
              </Center>
            </Box>
          }
        </Container>
      }
    </Layout>
  )
}