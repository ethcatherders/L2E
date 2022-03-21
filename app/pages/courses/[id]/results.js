import { Container, Heading, Text, Button, Box } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Layout from "../../../components/Layout";

export default function Result() {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [mintLink, setMintLink] = useState('#');
  const { user, isInitialized, Moralis } = useMoralis();
  const router = useRouter();
  const minimumPassingPercentage = 0.7;

  useEffect(async () => {
    if (isInitialized && user) {
      // await getAnswers();
      await getScore();
    }
  }, [isInitialized]);

  useEffect(async () => {
    const { id } = router.query;
    if (isInitialized && user && id) {
      // await getAnswers();
      await getScore();
    }
  }, [router.query.id]);
  
  async function getScore() {
    try {
      const course = await getCourse();
      const fromUser = course.attributes.responses.filter(response => response.user === user.id);
      const answers = course.attributes.quiz.map(item => item.answer);
      const { match, total } = compareAnswers(fromUser[fromUser.length - 1].answers, answers);
      setScore({ correct: match, total: total });
      if (match / total >= minimumPassingPercentage) {
        const link = await getPoapLinkForMinting(course);
        setMintLink(link);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getCourse() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;
    const result = await query.get(id);
    return result;
  }
  
  /*
    1. Query user data to get array of POAPs already minted by individual
    2. Find ID of POAP in array (if ID not found, then continue)
    3. Query Course and count number of times user completed this course (if only once - as in now - then continue)
    4. Return boolean to determine whether user can mint a POAP or not
  */
  async function checkEligibleToMintPoap(courseObj) {
    let poap;

    // Check if Course contains a relation to a POAP
    try {
      poap = courseObj.attributes.poap;
      if (!poap) return eligibleToMint = false;
    } catch (error) {
      console.error(error);
    }

    // Check if User already minted the POAP before
    try {
      const poapsMinted = user.attributes.poaps;
      const alreadyMinted = poapsMinted.includes(poap);
      if (alreadyMinted) return eligibleToMint = false;
    } catch (error) {
      console.error(error);
    }

    // Check if User completed this course at least once before
    // If so, then User is not eligible to mint a POAP
    try {
      const completionCount = courseObj.attributes.responses.filter(response => response.user === user.id);
      if (completionCount.length > 1) return eligibleToMint = false;
    } catch (error) {
      console.error(error);
    }

    return eligibleToMint = true;
  }
  
  /*
    1. Use checkEligibleToMintPoap() function (if user qualifies, continue)
    2. Query POAP object from Moralis by ID from Course object
    3. Return mint link from last item in array using pop() function
    ** The link will be a state variable and used as href for mint button **
  */
  async function getPoapLinkForMinting(courseObj) {
    const eligibleToMint = await checkEligibleToMintPoap();
    if (eligibleToMint) {
      try {
        const POAP = Moralis.Object.extend("Poap");
        const query = new Moralis.Query(POAP);
        const { id } = courseObj.attributes.poap;
        const poap = await query.get(id);
        const link = poap.attributes.mintLinks.pop();
        if (link) return link;
      } catch (error) {
        console.error(error);
        return '#';
      }
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
  
  // async function getAnswers() {
  //   const Course = Moralis.Object.extend("Course");
  //   const query = new Moralis.Query(Course);
  //   const { id } = router.query;

  //   try {
  //     const result = await query.get(id);
  //     const fromUser = result.attributes.responses.filter(response => response.user === user.id);
  //     const answers = result.attributes.quiz.map(item => item.answer);
  //     const { match, total } = compareAnswers(fromUser[fromUser.length - 1].answers, answers);
  //     setScore({ correct: match, total: total });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

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
        {score.correct / score.total >= minimumPassingPercentage ? 
          <Box>
            <Text>
              Congrats! You passed!
            </Text>
            <Link href={mintLink}>
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