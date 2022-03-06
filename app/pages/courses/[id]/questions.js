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
} from "@chakra-ui/react";

export default function Questions() {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState([]);
  const { isInitialized, Moralis, user } = useMoralis();
  const router = useRouter();

  useEffect(async () => {
    if (isInitialized) {
      setQuiz(await getCourseQuestions());
      setAnswers(Array(quiz.length));
    }
  }, [isInitialized]);

  async function getCourseQuestions() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      return result.attributes.quiz;
    } catch (error) {
      console.error(error);
      return [
        {
          id: 1,
          question: 'This is a sample question',
          options: ['option 1', 'option 2', 'option 3', 'option 4'],
        },
        {
          id: 2,
          question: 'This is a second question for example',
          options: ['option 1', 'option 2', 'option 3', 'option 4'],
        }
      ]
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
      result.addUnique("responses", { user, answers });
      await result.save();
      user.addUnique("coursesCompleted", result);
      await user.save();
    } catch (error) {
      console.error(error);
      console.log({ user, answers });
    }
  }

  return (
    <Layout>
      <Container padding={10}>
        {!user ? 
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
          :
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
            <Link href={`/courses/${router.query.id}/results`}>
              <Button type="button">
                View Results
              </Button>
            </Link>
          </form>
        }
      </Container>
    </Layout>
  )
}