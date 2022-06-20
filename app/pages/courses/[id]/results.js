import { Container, Heading, Text, Button, Box, Input, HStack, IconButton, Alert, AlertDescription, AlertIcon } from "@chakra-ui/react";
import { CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Layout from "../../../components/Layout";

export default function Result() {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [mintLink, setMintLink] = useState('#');
  const [statusMsg, setStatusMsg] = useState(null)

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
    // console.log("Router: ", router);
    // console.log("Router.query: ", router.query);
    if (isInitialized && id) {
      // await getAnswers();
      await getScore();
    }
  }, [router.query.id]);
  
  // Move this to Cloud function in Moralis
  // If the score qualifies for POAP, append the uuid of submission to POAP/Course object to prevent multiple mints from same submission
  // This should work whether signed in or not
  async function getScore() {
    try {
      const course = await getCourse();
      const fromUser = course.attributes.responses.filter(response => response.id === router.query.entry);
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
  async function checkEligibleToMintPoap(courseObj, poapId) {

    // Check if Course contains a relation to a POAP
    // try {
    //   poap = courseObj.attributes.poap;
    //   if (!poap) return false;
    // } catch (error) {
    //   console.error(error);
    // }
    
    if (user) {
      // Check if User already minted the POAP before
      try {
        const poapsMinted = user.attributes.poaps;
        const alreadyMinted = poapsMinted.includes(poapId);
        if (alreadyMinted) return false;
      } catch (error) {
        console.error(error);
      }
      
      // Check if User completed this course at least once before
      // If so, then User is not eligible to mint a POAP
      try {
        const completionCount = courseObj.attributes.responses.filter(response => response.user === user.id);
        if (completionCount.length > 1) return false;
      } catch (error) {
        console.error(error);
      }
    }

    // Check if this particular entry was already processed for minting
    try {
      const completed = courseObj.attributes.responses.find(response => response.id === router.query.entry);
      if (completed.minted) return false;
    } catch (error) {
      console.error(error);
    }

    return true;
  }
  
  /*
    1. Use checkEligibleToMintPoap() function (if user qualifies, continue)
    2. Query POAP object from Moralis by ID from Course object
    3. Return mint link from last item in array using pop() function
    ** The link will be a state variable and used as href for mint button **
  */
  async function getPoapLinkForMinting(course) {
    try {
      const POAP = Moralis.Object.extend("POAP");
      const query = new Moralis.Query(POAP);
      query.equalTo("course", course)
      const poap = await query.first()
      console.log(poap)
      
      // const { id } = courseObj.attributes.poap;
      // const poap = await query.get(id);
      const eligibleToMint = await checkEligibleToMintPoap(course, poap.id);
      if (eligibleToMint) {
        const link = poap.attributes.mintLinks.pop();
        if (link) return link;
      }

      // Add 'minted: true' to response in courseObj
    } catch (error) {
      console.error(error);
      return '#';
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

  function copyToClipboard() {
    navigator.clipboard.writeText(mintLink);
    setStatusMsg("Copied to clipboard")
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
            {/* <Link href={mintLink} passHref>
              <a target="_blank">
                <Button mt={2}>
                  Mint POAP
                </Button>
              </a>
            </Link> */}
            <HStack mt={2} justifyContent="center" alignItems="center">
              <Input type="text" value={mintLink} maxWidth={250} />
              <IconButton aria-label="Copy to clipboard" icon={<CopyIcon/>} onClick={copyToClipboard} />
              <Link href={mintLink} passHref>
                <a target="_blank">
                  <IconButton aria-label="Go to mint site" icon={<ExternalLinkIcon/>} />
                </a>
              </Link>
            </HStack>
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
        <Alert
          status="success"
          hidden={!statusMsg}
        >
          <AlertIcon/>
          <AlertDescription>{statusMsg}</AlertDescription>
        </Alert>
      </Container>
    </Layout>
  )
}