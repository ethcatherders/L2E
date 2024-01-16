import {
  Grid,
  GridItem,
  Container,
  Box,
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
  Button,
  VStack,
} from "@chakra-ui/react";
import NextImage from "next/image";
import NextLink from "next/link";
import styles from "../styles/Home.module.css";
import pic from "../public/ECHLogo.png";
import Videos from "../components/videos";
import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Quiz from "../components/quiz";
import Result from "../components/results";

export default function Home() {
  const [showcaseWidth, setShowcaseWidth] = useState("100%");
  const { user, isInitialized, Moralis } = useMoralis();
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (document && document.getElementById("showcase")) {
      setShowcaseWidth(document.getElementById("showcase").offsetWidth);
      window.addEventListener("resize", () => {
        if (document && document.getElementById("showcase")) {
          setShowcaseWidth(document.getElementById("showcase").offsetWidth);
        }
      });
    }
  });

  let tab;
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    tab = urlParams.get("tab");
  }

  return (
    <Layout>
      <Container maxW="container.xl" paddingTop={5} paddingBottom={5}>
        <VStack
          justify="center"
          align="center"
          textAlign="center"
          minH="70vh"
          spacing={4}
        >
          <Heading>ECH Learn2Earn</Heading>
          <Text maxWidth={600}>
            Learn2Earn is a platform that allows you to learn about Ethereum and
            get rewarded for it in the process. Watch the videos, take the quiz
            and earn an NFT!
          </Text>
          <NextLink href={`/courses/${"FcJNeRkHph"}`}>
            <Button>Learn about Dencun</Button>
          </NextLink>
        </VStack>
        {/* {courses.length ?
          <NextLink href={`/courses/${courses[0].id}`}>
            <Flex id='showcase' direction='column' justify='center' align='center' mb={10} borderRadius="2xl" width="100%" height={250} border="1px solid grey" cursor="pointer" overflow='hidden'>
              <Center
                zIndex={1}
                position='absolute'
                maxW={showcaseWidth}
              >
                <Heading
                  size='xl'
                  noOfLines={2}
                  color='white'
                  textAlign='center'
                >
                  {courses[0].title}
                </Heading>
              </Center>
              <Image
                src={courses[0].thumbnail}
                fallback={<Skeleton height={250} width='100%' />}
                position='relative'
                objectFit='cover'
                height={250}
                width='100%'
                transition='all .5s ease'
                overflow='hidden'
                borderRadius="2xl"
                _hover={{ transform: 'scale(1.2)' }}
              />
              <Flex width='100%' justify='start' align='center'>
                <Flex position='absolute' gap={4} justify='center' align='center' mt={-76} ml={10}>
                  <Circle
                    border='1px solid grey'
                    padding={1}
                  >
                    <Avatar
                      src={courses[0].speakerImg && `https://gateway.moralisipfs.com/ipfs/${courses[0].speakerImg}`}
                      height={50}
                      width={50}
                    />
                  </Circle>
                  <Heading
                    size='xs'
                    noOfLines={1}
                    color='white'
                  >
                    {courses[0].speaker ?? 'Unknown'}
                  </Heading>
                </Flex>
              </Flex>
              <Flex width='100%' justify='end'>
                <Text
                  position='absolute'
                  textAlign='right'
                  paddingX={2}
                  paddingY={0.25}
                  borderRadius={10}
                  background={colorMode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(254, 194, 113, 0.8)'}
                  color={colorMode === 'dark' ? 'white' : 'rgba(70, 69, 67, 1)'}
                  mr={4}
                  mt={-10}
                  zIndex={1}
                >
                  {courses[0].videoDuration ?? '--'} min
                </Text>
              </Flex>
            </Flex>
          </NextLink>
          :
          ""
        }
        <Grid templateColumns={'repeat(auto-fit, minmax(200px, 1fr))'} gap={5}>
          {courses.slice(1).map((course, index) =>
            <NextLink href={`/courses/${course.id}`} key={index}>
              <GridItem
                // display='flex'
                // flexDir='column'
                bg="rgba(36, 39, 48, 1)"
                borderRadius='2xl'
                maxWidth='350px'
                minHeight='fit-content'
                border='1px solid grey'
                cursor='pointer'
                overflow='hidden'
              >
                <Flex width='100%' justify='end'>
                  <Text
                    position='absolute'
                    textAlign='right'
                    paddingX={2}
                    paddingY={0.25}
                    borderRadius={10}
                    background={colorMode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(254, 194, 113, 0.8)'}
                    color={colorMode === 'dark' ? 'white' : 'rgba(70, 69, 67, 1)'}
                    mr={2}
                    mt={2}
                    zIndex={1}
                  >
                    {course.videoDuration ?? '--'} min
                  </Text>
                </Flex>
                <AspectRatio overflow='hidden' borderTopRadius='2xl' ratio={1.75}>
                  <Image
                    src={course.thumbnail}
                    fallback={<Skeleton width='100%' height='100%' />}
                    objectFit='cover'
                    transition='all .5s ease'
                    _hover={{ transform: 'scale(1.2)' }}
                    zIndex={0}
                  />
                </AspectRatio>
                <Flex
                  direction='column'
                  // justify='center'
                  align='end'
                  paddingX={4}
                  paddingTop={4}
                  paddingBottom={1}
                  borderBottomRadius='2xl'
                  height={100}
                  zIndex={1}
                  bg={colorMode === 'dark' ? "rgba(36, 39, 48, 1)" : "rgba(196, 196, 196, 1)"}
                >
                  <Circle
                    position='absolute'
                    mt={-10}
                    border='1px solid grey'
                    padding={1}
                  >
                    <Avatar
                      src={course.speakerImg && `https://gateway.moralisipfs.com/ipfs/${course.speakerImg}`}
                      height={50}
                      width={50}
                    />
                  </Circle>
                  <Heading
                    size='xs'
                    noOfLines={1}
                    alignSelf='start'
                    color={colorMode === 'dark' ? 'rgba(183, 185, 210, 1)' : 'rgba(70, 69, 67, 1)'}
                  >
                    {course.speaker ?? 'Unknown'}
                  </Heading>
                  <Heading
                    size='sm'
                    noOfLines={2}
                    alignSelf='start'
                    mt={2}
                  >
                    {course.title}
                  </Heading>
                  {course.completed && (
                    <Text textColor='green' fontSize={10} textAlign='right' position='absolute' mt={63}>
                      Completed
                    </Text>
                  )}
                </Flex>
              </GridItem>
            </NextLink>
          )}
        </Grid> */}
        {/* {tab === "quiz" ? <Quiz /> : tab === "result" ? <Result /> : <Videos />} */}
      </Container>
    </Layout>
  );
}
