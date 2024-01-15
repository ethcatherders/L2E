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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import Link from "next/link";

export default function Result() {
  const [courses, setCourses] = useState();
  const { user, isInitialized, Moralis } = useMoralis();
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
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
          (cc) => cc.id === course.id
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
      setAnswers(
        results[1]?.responses.find((item) => item.user === user.id).answers
      );
      getScore();
    }
  }
  function compareAnswers(array1, array2) {
    let score = 0;

    for (let i = 0; array1.length > i && array2.length > i; i++) {
      if (array1[i] === array2[i]) {
        score++;
      }
    }
    return score;
  }
  useEffect(() => {
    if (answers.length > 0) {
      setScore(
        compareAnswers(
          answers,
          courses?.quiz?.map((item) => item.answer)
        )
      );
    }
  });
  function getScore() {
    const correctAnswers = courses?.quiz?.map((item) => item.answer);
  }
  return (
    <Box style={{ display: "flex", justifyContent: "center" }}>
      {user && isSubmitted ? (
        <Text
          fontWeight={"bold"}
          color={"lightGreen"}
          fontSize={{ lg: "3xl", md: "2xl", base: "xl" }}
        >
          <span style={{ color: "white" }}>Score:</span> {score}/
          {courses?.quiz.length}
        </Text>
      ) : user && !isSubmitted ? (
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
            You have not taken the quiz yet!
          </Text>
          <Link href="/?tab=quiz">
            <Button variant="ghost" style={{ background: "green" }}>
              <Text fontSize={{ lg: "2xl", md: "xl", base: "lg" }}>
                Take the quiz now
              </Text>
            </Button>
          </Link>
        </Box>
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
    </Box>
  );
}
