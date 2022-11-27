import { Heading, Text, Button, Box, Input, HStack, IconButton, useColorMode, useToast } from "@chakra-ui/react";
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
  const { colorMode } = useColorMode();
  const toast = useToast();

  const minimumPassingPercentage = 1;

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
      console.log("fromUser:", fromUser)
      const questions = course.attributes.quiz.filter(q => !!fromUser[fromUser.length - 1].answers.find(fu => fu.id === q.id))
      console.log("Questions:", questions)
      const userAnswers = fromUser[fromUser.length - 1].answers.map(item => item.answer)
      const actualAnswers = questions.map(item => item.answer);
      const { match, total } = compareAnswers(userAnswers, actualAnswers);
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
  async function checkEligibleToMintPoap(courseObj, poapObj) {

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
        // const poapsMinted = user.attributes.poapsEarned;
        // const alreadyMinted = poapsMinted.includes(poapId);
        // if (alreadyMinted) return false;
        if (poapObj.attributes.earnedBy && poapObj.attributes.earnedBy.includes(user)) return false
        if (user.attributes.poapsEarned && user.attributes.poapsEarned.find(pe => pe.id === poapObj.id)) return false
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
      const eligibleToMint = await checkEligibleToMintPoap(course, poap);
      if (eligibleToMint) {
        const link = poap.attributes.mintLinks[0];
        if (link) {
          if (user) {
            user.addUnique("poapsEarned", { id: poap.id, mintLink: link, timestamp: Date.now() })
            poap.addUnique("earnedBy", user)
            await user.save()
          }

          const remainingLinks = poap.attributes.mintLinks.slice(1, poap.attributes.mintLinks.length - 1)
          poap.set("mintLinks", remainingLinks)
          await poap.save()

          return link;
        }
      }

      return '#'

      // Add 'minted: true' to response in courseObj
    } catch (error) {
      console.error(error);
      return '#';
    }
  }

  function compareAnswers(array1, array2) {
    const result = { match: 0, total: 0 };
    console.log("array1:", array1, "array2:", array2)
    for (let i = 0; array1.length > i && array2.length > i; i++) {
      if (array2.includes(array1[i])) {
        result.match++;
      }
    }
    result.total = array2.length;
    return result;
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(mintLink);
    setStatusMsg("Copied to clipboard")
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 3000,
      position: 'bottom-right'
    })
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
      <Box
        textAlign='center'
        height='100%'
        bg={colorMode === 'dark' ? "rgba(229, 229, 229, 0.13)" : 'rgba(220, 220, 220, 1)'}
        padding={5}
      >
        {score.correct / score.total >= minimumPassingPercentage && (
          <Heading marginBottom={5}>
            Congratulations! You passed!
          </Heading>
        )}
        <Heading size='md' marginBottom={5}>
          {score.correct}/{score.total} Correct
        </Heading>
        {score.correct / score.total >= minimumPassingPercentage ?
          <Box>
            {mintLink === '#' ? (
              <Link href='/' passHref>
                <Button mt={2}>
                  Back to Home
                </Button>
              </Link>
            ) : (
              <>
                <Text>
                  You earned a POAP as a reward.
                </Text>
                <HStack mt={2} justifyContent="center" alignItems="center">
                  <Input type="text" value={mintLink} maxWidth={250} bg={colorMode === 'light' ? 'whiteAlpha.700' : 'transparent'} />
                  <IconButton aria-label="Copy to clipboard" icon={<CopyIcon />} onClick={copyToClipboard} />
                  <Link href={mintLink} passHref>
                    <a target="_blank">
                      <IconButton aria-label="Go to mint site" icon={<ExternalLinkIcon />} />
                    </a>
                  </Link>
                  <a href="https://twitter.com/intent/tweet?originACCCWal_referer=https%3A%2F%2Fpublish.twitter.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Eshare%7Ctwgr%5E&text=I%20am%20excited%20to%20share%20that%20I%20took%20quiz%20on%20%22ECH%20Learn2Earn%22%20and%20received%20this%20NFT.%20Try%20it%20today%20at&url=https%3A%2F%2Fl2e.ethereumcatherders.com%2F" target="_blank"><Button>
                    Tweet
                  </Button></a>
                </HStack>
                <Link href='/' passHref>
                  <Button mt={2}>
                    Back to Home
                  </Button>
                </Link>
              </>
            )}
          </Box>
          :
          <Box>
            <Text>
              Better luck next time :(
            </Text>
            <Link href='/' passHref>
              <Button mt={2}>
                Back to Home
              </Button>
            </Link>
          </Box>
        }
      </Box>
    </Layout>
  )
}