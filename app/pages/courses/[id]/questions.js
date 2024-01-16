import { useEffect, useRef, useState } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../../components/Layout";
import {
  Text,
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
  Heading,
  useColorMode,
  useToast,
  ButtonGroup,
} from "@chakra-ui/react";
import ReCAPTCHA from "react-google-recaptcha";
import uuid from "react-uuid";
import Progress from "react-progressbar";

export default function Questions() {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [index, setIndex] = useState(0);
  const [displayBtn, setDisplayBtn] = useState(false);
  const [restricted, setRestricted] = useState(false);

  const router = useRouter();

  const { isInitialized, Moralis, user } = useMoralis();
  const { colorMode } = useColorMode();
  const toast = useToast();

  const [valid, setValid] = useState(false);
  const recaptchaRef = useRef();

  useEffect(async () => {
    const { id } = router.query;
    if (isInitialized && id) {
      if (user) {
        setQuiz(await getCourseQuestions());
        setAnswers(Array(quiz.length));
        setRestricted(false);
      } else {
        setRestricted(true);
      }
    }
  }, [isInitialized, user, router.query.id]);

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

  async function getCourseQuestions() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      const quizLength =
        result.attributes.quiz.length <= 5 ? result.attributes.quiz.length : 5;

      // Uncomment this to make sure only one attempt is allowed per user
      // let completed = false;
      // if (user && user.attributes.coursesCompleted) {
      //   completed = !!user.attributes.coursesCompleted.find(
      //     (cc) => cc.id === id
      //   );
      // }

      // if (completed) {
      //   setIsSubmitted(true);
      //   setSubmissionId(
      //     result?.attributes?.responses.filter(
      //       (item) => item.user === user.id
      //     )[0].id
      //   );
      // }

      if (quizLength < result.attributes.quiz.length) {
        const questions = [];
        while (questions.length < quizLength) {
          const randomIndex = parseInt(
            Math.random() * result.attributes.quiz.length
          );
          console.log(randomIndex);
          const question = {
            id: result.attributes.quiz[randomIndex].id,
            question: result.attributes.quiz[randomIndex].question,
            options: result.attributes.quiz[randomIndex].options,
          };
          if (!questions.find((q) => q.id === question.id)) {
            questions.push(question);
          }
        }
        return questions;
      }

      return result.attributes.quiz.map((item) => {
        return {
          id: item.id,
          question: item.question,
          options: item.options,
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function nextQuestion() {
    if (index + 1 < quiz.length) {
      if (index + 1 == quiz.length - 1) {
        setDisplayBtn(true);
      }
      setIndex(index + 1);
    }
  }

  function prevQuestion() {
    if (index - 1 >= 0) {
      if (displayBtn) {
        setDisplayBtn(false);
      }
      return setIndex(index - 1);
    }
  }

  function selectAnswer(value, quizIndex) {
    const newAnswers = [...answers];
    newAnswers[quizIndex] = value;
    setAnswers(newAnswers);
  }

  async function submit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (valid) {
      try {
        const Course = Moralis.Object.extend("Course");
        const query = new Moralis.Query(Course);
        const { id } = router.query;

        const result = await query.get(id);
        const userId = user.id;
        const entryId = uuid();
        setSubmissionId(entryId);

        console.log("Submission ID: ", submissionId);
        const submittedAnswers = answers.map((a, i) => {
          return { id: quiz[i].id, answer: a };
        });
        result.addUnique("responses", {
          id: entryId,
          user: userId,
          answers: submittedAnswers,
          timestamp: new Date().toUTCString(),
        });
        await result.save();
        if (user) {
          user.addUnique("coursesCompleted", result);
          await user.save();
        }
        return setIsSubmitted(true);
      } catch (error) {
        console.error(error);
        toast({
          status: "error",
          title: "Something went wrong",
          description: "Please try again later.",
          position: "bottom-right",
          duration: 3000,
        });
        // setErrorMsg('Something went wrong. Please try again later.');
      }
    } else {
      toast({
        status: "error",
        title: "ReCaptcha Error",
        description: "Please verify with the ReCaptcha before submitting.",
        position: "bottom-right",
        duration: 3000,
      });
      // setErrorMsg("Please verify with the ReCaptcha before submitting.");
    }
  }

  return (
    <Layout>
      {/* <Container background="blue"> */}
      {!isSubmitted ? (
        <Box
          background={
            colorMode === "dark"
              ? "rgba(229, 229, 229, 0.13)"
              : "rgba(220, 220, 220, 1)"
          }
          padding={5}
          minH="70vh"
          borderRadius={10}
          marginX={5}
        >
          {restricted ? (
            <VStack height="100%" justify="center" minH="60vh">
              <Heading>Please connect your wallet to take the quiz.</Heading>
            </VStack>
          ) : (
            <>
              {quiz.length ? (
                <form onSubmit={submit} style={{ height: "100%" }}>
                  <Progress completed={index * (100 / quiz.length)} />
                  <VStack
                    align="flex-start"
                    minHeight="60vh"
                    justify="space-between"
                    mt={4}
                  >
                    <Box textAlign="center" width={"100%"}>
                      {/* <Heading size="md" mb={5}>
                        Question #{index + 1}
                      </Heading> */}
                      <FormControl
                        as="fieldset"
                        isRequired
                        paddingBottom={10}
                        textAlign="center"
                        width={"100%"}
                      >
                        {/* <FormLabel as="legend" textAlign="center" width="100%"> */}
                        <Center>
                          <Heading size="md" mb={5} mt={8} maxWidth={800}>
                            {`${index + 1}.`} {quiz[index].question}
                          </Heading>
                        </Center>
                        {/* </FormLabel> */}
                        {/* <RadioGroup
                          paddingLeft={5}
                          value={answers[index]}
                          onChange={(e) => selectAnswer(e, index)}
                        > */}
                        <VStack>
                          {quiz[index].options.map((option, optIndex) => (
                            <>
                              <Box
                                key={option}
                                maxWidth={500}
                                width={"100%"}
                                p={4}
                                borderRadius={10}
                                onClick={() => selectAnswer(option, index)}
                                background={
                                  answers[index] === option
                                    ? "rgba(32, 223, 127, 1)"
                                    : colorMode === "dark"
                                    ? "rgba(229, 229, 229, 0.4)"
                                    : "white"
                                }
                                _hover={{
                                  cursor: "pointer",
                                  background:
                                    answers[index] === option
                                      ? "rgba(32, 223, 127, 0.8)"
                                      : "rgba(255, 255, 255, 0.6)",
                                }}
                              >
                                <Text>{option}</Text>
                              </Box>
                              {/* <Radio
                                value={option}
                                key={optIndex}
                                borderColor={
                                  colorMode === "light" && "rgba(70, 69, 67, 1)"
                                }
                              >
                                {option}
                              </Radio> */}
                            </>
                          ))}
                        </VStack>
                        {/* </RadioGroup> */}
                      </FormControl>
                    </Box>
                    {!displayBtn ? (
                      <ButtonGroup
                        justifyContent="center"
                        alignItems="center"
                        gap={8}
                        mt={5}
                        width="100%"
                      >
                        <Button
                          type="button"
                          onClick={prevQuestion}
                          backgroundColor={
                            colorMode === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(128, 129, 145, 1)"
                          }
                          color={"white"}
                          width={"40%"}
                          maxW={200}
                          hidden={index === 0}
                        >
                          Back
                        </Button>
                        <Button
                          _hover={{
                            backgroundColor: "rgba(32, 223, 127, 0.5)",
                          }}
                          type="button"
                          onClick={nextQuestion}
                          backgroundColor="rgba(32, 223, 127, 1)"
                          color="black"
                          isDisabled={!answers[index]}
                          width={"40%"}
                          maxW={200}
                        >
                          Next
                        </Button>
                      </ButtonGroup>
                    ) : (
                      <VStack
                        justifyContent="center"
                        alignItems="center"
                        gap={5}
                        mt={5}
                        width="100%"
                      >
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          size="compact"
                          sitekey={process.env.ReCaptchaSiteKey}
                          onChange={validateCaptcha}
                        />
                        <ButtonGroup
                          justifyContent="center"
                          alignItems="center"
                          gap={8}
                          mt={5}
                          width="100%"
                        >
                          <Button
                            type="button"
                            onClick={prevQuestion}
                            backgroundColor={
                              colorMode === "dark"
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(128, 129, 145, 1)"
                            }
                            color={"white"}
                            hidden={index === 0}
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            backgroundColor="rgba(32, 223, 127, 1)"
                            _hover={{
                              backgroundColor: "rgba(32, 223, 127, 0.5)",
                            }}
                            isDisabled={!answers[index]}
                          >
                            Submit
                          </Button>
                        </ButtonGroup>
                      </VStack>
                    )}
                  </VStack>
                </form>
              ) : (
                <Center>
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    // emptyColor='gray.200'
                    color="gray.500"
                    size="xl"
                  />
                </Center>
              )}
            </>
          )}
        </Box>
      ) : (
        <VStack
          // background={
          //   colorMode === "dark"
          //     ? "rgba(229, 229, 229, 0.13)"
          //     : "rgba(220, 220, 220, 1)"
          // }
          padding={5}
          minH="70vh"
          borderRadius={10}
          spacing={5}
          justify="center"
          align="center"
        >
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            // height="200px"
            borderRadius={10}
            // marginBottom={5}
            width="fit-content"
            paddingY={8}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Answers Submitted!
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              Click on &apos;View Results&apos; to see your score and
              potentially earn an NFT!
            </AlertDescription>
            <Center mt={8}>
              <Link
                href={`/courses/${router.query.id}/results?entry=${submissionId}`}
              >
                <Button
                  type="button"
                  isDisabled={!submissionId}
                  color="white"
                  backgroundColor="rgba(35, 35, 35, 1)"
                  _hover={{
                    backgroundColor: "rgba(35, 35, 35, 0.5)",
                  }}
                >
                  View Results
                </Button>
              </Link>
            </Center>
          </Alert>
        </VStack>
      )}
      {/* </Container> */}
    </Layout>
  );
}
