import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import uuid from "react-uuid";
import {
  Grid,
  GridItem,
  Container,
  Box,
  Button,
  Text,
  Center,
  Heading,
  Image,
  AspectRatio,
  Flex,
  Skeleton,
  useColorMode,
  Circle,
  Avatar,
  VStack,
} from "@chakra-ui/react";
import Progress from "react-progressbar";

export default function Quiz() {
  const [index, setIndex] = useState(0);
  const [courses, setCourses] = useState();
  const { user, isInitialized, Moralis } = useMoralis();
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  const {colorMode} = useColorMode();

  useEffect(() => {
    async function fetchData() {
      if (isInitialized) {
        // Query courses from Moralis
        await getCourses();
      }
    }

    fetchData();
  }, [isInitialized]);

  async function getCourses() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const results = await query.map((course) => {
      let thumbnailUrl;
      if (course.attributes.videoUrl) {
        const startIndex = "https://www.youtube.com/embed/".length;
        thumbnailUrl = `http://img.youtube.com/vi/${course.attributes.videoUrl.substring(
          startIndex
        )}/maxresdefault.jpg`;
      }

      let completed = false;
      if (user && user.attributes.coursesCompleted) {
        completed = !!user.attributes.coursesCompleted.find(
          (cc) => cc.id === "flezBQjCxL"
        );
      }

      return {
        id: course.id,
        ...course.attributes,
        completed,
        thumbnail: thumbnailUrl ? thumbnailUrl : pic,
        createdAt: course.createdAt,
      };
    });
    setCourses(results[1]);
    if (results[1].completed) {
      setIsSubmitted(true);
    }
  }

  function checkOption(option) {
    setSelectOption(option);
  }
  async function submit() {
    try {
      alert("Confirm your submission");
      const submittedAnswer = [...answers, selectedOption];

      const Course = Moralis.Object.extend("Course");
      const query = new Moralis.Query(Course);

      const result = await query.get("flezBQjCxL");
      const userId = user.id;
      const entryId = uuid();
      setSubmissionId(entryId);
      console.log("Submission ID: ", submissionId);

      // const submittedAnswers = answers.map((a, i) => ({
      //   id: courses.quiz[1].id,
      //   answer: a,
      // }));

      result.addUnique("responses", {
        id: entryId,
        user: userId,
        answers: submittedAnswer,
        timestamp: new Date().toUTCString(),
      });

      await result.save();

      if (user) {
        user.addUnique("coursesCompleted", result);
        await user.save();
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
    }
  }

  function handleNext() {
    setAnswers((prevAnswers) => [...prevAnswers, selectedOption]);
    setIndex(index + 1);
  }

  return (
    <>
      {user && isSubmitted ? (
        <VStack
          // style={{
          //   display: "flex",
          //   flexDirection: "column",
          //   justifyContent: "center",
          //   alignItems: "center",
          //   gap: "1rem",
          // }}
          justify="center"
          align="center"
          gap={4}
          background={
            colorMode === "dark"
              ? "rgba(229, 229, 229, 0.13)"
              : "rgba(220, 220, 220, 1)"
          }
          padding={5}
          minH="70vh"
          borderRadius={10}
        >
          <Text fontSize={{ lg: "2xl", md: "xl", base: "lg" }}>
            You have already taken the quiz
          </Text>
          <Link href="/?tab=result">
            <Button backgroundColor="rgba(32, 223, 127, 0.9)" _hover={{ backgroundColor: "rgba(32, 223, 127, 0.5)" }}>
              <Text fontSize={{ lg: "2xl", md: "xl", base: "lg" }}>
                Check your results
              </Text>
            </Button>
          </Link>
        </VStack>
      ) : user && !isSubmitted ? (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                textAlign: "center",
                width: "40rem",
              }}
            >
              <Progress completed={index * (100 / courses?.quiz.length)} />
              <span style={{ fontSize: "2rem" }}>
                <Text fontSize={{ lg: "3xl", md: "2xl", base: "xl" }}>
                  {courses?.quiz[index].question}
                </Text>
              </span>
              <span
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {courses?.quiz[index].options.map((op) => (
                  <Box
                    key={op}
                    onClick={() => checkOption(op)}
                    style={{
                      background: selectedOption === op ? "green" : "white",
                      padding: "1rem",
                      borderRadius: 10,
                      color: selectedOption === op ? "white" : "black",
                    }}
                    _hover={{ cursor: "pointer" }}
                  >
                    <Text fontSize={{ lg: "xl", md: "lg", base: "md" }}>
                      {op}
                    </Text>
                  </Box>
                ))}
              </span>
              <div>
                {index < courses?.quiz.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    style={{ background: "green", width: "5rem" }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={submit}
                    style={{ background: "green", width: "5rem" }}
                  >
                    Finish
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Text fontSize={{ lg: "2xl", md: "xl", base: "lg" }}>
            You need to login first
          </Text>
          {/* <a href="/?tab=quiz">
            <Button variant="ghost" style={{ background: "green" }}>
              <Text fontSize={{ lg: "2xl", md: "xl", base: "lg" }}>
                Take the quiz now
              </Text>
            </Button>
          </a> */}
        </Box>
      )}
    </>
  );
}
