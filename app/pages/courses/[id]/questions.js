import { useEffect, useRef, useState } from "react";
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
  Spinner,
  HStack,
  Heading
} from "@chakra-ui/react";
import ReCAPTCHA from "react-google-recaptcha";
import uuid from "react-uuid";

export default function Questions() {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [index, setIndex] = useState(0);
  const [displayBtn, setDisplayBtn] = useState(false);
  const router = useRouter();

  const { isInitialized, Moralis, user } = useMoralis();

  const [valid, setValid] = useState(false);
  const recaptchaRef = useRef();

  async function validateCaptcha() {
    const token = await recaptchaRef.current.getValue();
    const res = await fetch("/api/validateCaptcha", {
      method: "POST",
      body: JSON.stringify({ captcha: token }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    // Kick off the reCaptcha
    setValid(res.ok);
  }

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

  function nextQuestion() {
    if (index + 1 < quiz.length) {
      if (index + 1 == quiz.length - 1) {
        setDisplayBtn(true)
      }
      setIndex(index + 1)
    }
  }

  function prevQuestion() {
    if (index - 1 >= 0) {
      if (displayBtn) {
        setDisplayBtn(false)
      }
      return setIndex(index - 1)
    }
  }

  function selectAnswer(e, quizIndex) {
    answers[quizIndex] = e;
    setAnswers([...answers]);
  }

  async function submit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (valid) {
      const Course = Moralis.Object.extend("Course");
      const query = new Moralis.Query(Course);
      const { id } = router.query;
  
      try {
        const result = await query.get(id);
        const userId = user ? user.id : 'guest';
        const entryId = uuid();
        setSubmissionId(entryId);
        console.log("Submission ID: ", submissionId);
        result.addUnique("responses", { id: entryId, user: userId, answers, timestamp: (new Date()).toUTCString() });
        await result.save();
        if (user) {
          user.addUnique("coursesCompleted", result);
          await user.save();
        }
        return setIsSubmitted(true);
      } catch (error) {
        console.error(error);
        setErrorMsg('Something went wrong. Please try again later.');
      }
    } else {
      setErrorMsg("Please verify with the ReCaptcha before submitting.");
    }
  }

  return (
    <Layout>
      {/* <Container background="blue"> */}
        {!isSubmitted ?
          <Box background="rgba(229, 229, 229, 0.13)" padding={5}>
            {quiz.length ?
              <form onSubmit={submit}>
                {/* {quiz.map((quizItem, index) => 
                  <FormControl as='fieldset' isRequired key={index} paddingBottom={10}>
                    <FormLabel as='legend'>{quizItem.question}</FormLabel>
                    <RadioGroup paddingLeft={5} value={answers[index]} onChange={(e) => selectAnswer(e, index)}>
                      <VStack alignItems='flex-start'>
                        {quizItem.options.map((option, optIndex) =>
                          <Radio value={option} key={optIndex}>{option}</Radio>
                        )}
                      </VStack>
                    </RadioGroup>
                  </FormControl>
                )} */}
                <Heading size="md" mb={5}>Question #{index + 1}</Heading>
                <FormControl as='fieldset' isRequired paddingBottom={10}>
                  <FormLabel as='legend'>{quiz[index].question}</FormLabel>
                  <RadioGroup paddingLeft={5} value={answers[index]} onChange={(e) => selectAnswer(e, index)}>
                    <VStack alignItems='flex-start'>
                      {quiz[index].options.map((option, optIndex) =>
                        <Radio value={option} key={optIndex}>{option}</Radio>
                      )}
                    </VStack>
                  </RadioGroup>
                </FormControl>
                <Alert
                  status="error"
                  hidden={!errorMsg}
                >
                  <AlertIcon/>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
                {!displayBtn ?
                  <HStack justifyContent="center" alignItems="center" gap={10} mt={5} width="100%">
                    <Button type="button" onClick={prevQuestion}>
                      Back
                    </Button>
                    <Button type="button" onClick={nextQuestion}>
                      Next
                    </Button>
                  </HStack>
                  :
                  <VStack gap={5}>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      size="normal"
                      sitekey={process.env.ReCaptchaSiteKey}
                      onChange={validateCaptcha}
                    />
                    <HStack justifyContent="center" alignItems="center" gap={10} mt={5} width="100%">
                      <Button type="button" onClick={prevQuestion}>
                        Back
                      </Button>
                      <Button colorScheme="cyan" type="submit">
                        Submit
                      </Button>
                    </HStack>
                  </VStack>
                }
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
              <Link href={`/courses/${router.query.id}/results?entry=${submissionId}`}>
                <Button type="button">
                  View Results
                </Button>
              </Link>
            </Center>
          </Box>
        }
      {/* </Container> */}
    </Layout>
  )
}