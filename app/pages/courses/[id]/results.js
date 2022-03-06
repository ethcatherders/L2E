import { Container, Heading, Text, Center, Button, Box } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Layout from "../../../components/Layout";

export default function Result() {
  const [userAnswers, setUserAnswers] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const { user, isInitialized, Moralis } = useMoralis();
  const router = useRouter();

  useEffect(async () => {
    if (isInitialized) {
      await getAnswers();
      const { match, total } = compareAnswers(userAnswers, correctAnswers);
      setScore({ correct: match, total: total });
    }
  }, [isInitialized]);

  async function getAnswers() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      const fromUser = result.attributes.responses.filter(response => response.user == user);
      setCorrectAnswers(result.attributes.answers);
      setUserAnswers(fromUser[fromUser.length - 1]);
    } catch (error) {
      console.log(error);
      setCorrectAnswers(['option 1', 'option 2']);
      setUserAnswers(['option 4', 'option 2']);
    }
  }

  function compareAnswers(array1, array2) {
    const result = { match: 0, total: 0 };
    for (let i = 0; array1.length > i && array2.length > i; i++) {
      if (array1[i] === array2[i]) {
        result.match++;
      }
    }
    result.total = array2.length;
    return result;
  }

  return (
    <Layout>
      <Container
        textAlign='center'
        padding={20}
      >
          <Text>
            You scored
          </Text>
          <Heading marginBottom={5}>
            {score.correct} out of {score.total}
          </Heading>
          {score.correct / score.total >= 0.8 ? 
            <Box>
              <Text>
                Congrats! You passed!
              </Text>
              <Link href={`#`}>
                <Button mt={2}>
                  Mint POAP
                </Button>
              </Link>
            </Box>
            :
            <Box>
              <Text>
                Better luck next time :(
              </Text>
              <Link href='/'>
                <Button mt={2}>
                  Back to Home
                </Button>
              </Link>
            </Box>
          }
      </Container>
    </Layout>
  )
}