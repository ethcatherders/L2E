import {
  AspectRatio,
  HStack,
  VStack,
  Text,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import Link from "next/link";
import { useMoralis } from "react-moralis";
import homeIcon from "../../public/icons/home-icon.svg";
import homeIconDark from "../../public/icons/home-icon-dark.svg";
import homeIconActive from "../../public/icons/home-icon-active.svg";
import walletIcon from "../../public/icons/wallet-icon.svg";
import walletIconDark from "../../public/icons/wallet-icon-dark.svg";
import walletIconActive from "../../public/icons/wallet-icon-active.svg";
import resourceIcon from "../../public/icons/resource-icon.svg";
import resourceIconDark from "../../public/icons/resource-icon-dark.svg";
import resourceIconActive from "../../public/icons/resource-icon-active.svg";
import quizIcon from "../../public/icons/quiz-icon.svg";
import quizIconDark from "../../public/icons/quiz-icon-dark.svg";
import quizIconActive from "../../public/icons/quiz-icon-active.svg";
import videoIcon from "../../public/icons/video-icon.svg";
import videoIconDark from "../../public/icons/video-icon-dark.svg";
import videoIconActive from "../../public/icons/video-icon-active.svg";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { isDeterministicError } from "viem/utils";

export default function SideNav(props) {
  const [courseNav, setCourseNav] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const { isInitialized, Moralis, user } = useMoralis();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const router = useRouter();
  const { colorMode } = useColorMode();
  let tab;
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    tab = urlParams.get("tab");
  }

  useEffect(async () => {
    const { id } = router.query;
    if (isInitialized && id) {
      if (user) {
        await fetchData();
      }
    }
  }, [isInitialized, user, router.query.id]);

  async function fetchData() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;
    try {
      const result = await query.get(id);
      let completed = false;
      if (user && user.attributes.coursesCompleted) {
        completed = !!user.attributes.coursesCompleted.find(
          (cc) => cc.id === id
        );
      }

      if (completed) {
        setIsSubmitted(true);
        setSubmissionId(
          result?.attributes?.responses.filter(
            (item) => item.user === user.id
          )[0].id
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (router.pathname.includes("courses")) {
      if (router.pathname.includes("questions")) {
        setActiveTab("quiz");
        return setCourseNav(true);
      }
      if (router.pathname.includes("resources")) {
        setActiveTab("resources");
        return setCourseNav(true);
      }
      if (router.pathname.includes("results")) {
        setActiveTab("results");
        return setCourseNav(true);
      }
      setActiveTab("video");
      return setCourseNav(true);
    }

    setActiveTab("home");
    return setCourseNav(false);
    // if (tab === "quiz") {
    //   setActiveTab("quiz");
    //   return setCourseNav(false);
    // }
    // if (tab === "result") {
    //   setActiveTab("rewards");
    //   return setCourseNav(false);
    // }
    // setActiveTab("videos");
  }, [tab]);

  return (
    <Box>
      {courseNav ? (
        <VStack mt={10} gap={5}>
          <NextLink href="/" passHref>
            <HStack
              alignItems="center"
              width="100%"
              gap={5}
              cursor="pointer"
              _hover={{ color: "grey" }}
            >
              <Image
                src={
                  activeTab == "home"
                    ? homeIconActive
                    : colorMode === "dark"
                    ? homeIconDark
                    : homeIcon
                }
                alt="home"
                objectFit="cover"
                width={50}
                height={50}
              />
              <Text
                textAlign="left"
                fontWeight={activeTab == "home" ? "bold" : "normal"}
              >
                Discover
              </Text>
            </HStack>
          </NextLink>
          <NextLink href={`/courses/${router.query.id}/`} passHref>
            <HStack
              alignItems="center"
              width="100%"
              gap={5}
              cursor="pointer"
              _hover={{ color: "grey" }}
            >
              <Image
                src={
                  activeTab == "video"
                    ? videoIconActive
                    : colorMode === "dark"
                    ? videoIconDark
                    : videoIcon
                }
                alt="video"
                objectFit="cover"
                width={50}
                height={50}
              />
              <Text
                textAlign="left"
                fontWeight={activeTab == "video" ? "bold" : "normal"}
              >
                Videos
              </Text>
            </HStack>
          </NextLink>
          <NextLink href={`/courses/${router.query.id}/resources`} passHref>
            <HStack
              alignItems="center"
              width="100%"
              gap={5}
              cursor="pointer"
              _hover={{ color: "grey" }}
            >
              <Image
                src={
                  activeTab == "resources"
                    ? resourceIconActive
                    : colorMode === "dark"
                    ? resourceIconDark
                    : resourceIcon
                }
                alt="extra resources"
                objectFit="cover"
                width={50}
                height={50}
              />
              <Text
                textAlign="left"
                fontWeight={activeTab == "resources" ? "bold" : "normal"}
              >
                Extra Resources
              </Text>
            </HStack>
          </NextLink>
          <NextLink href={`/courses/${router.query.id}/questions`} passHref>
            <HStack
              alignItems="center"
              width="100%"
              gap={5}
              cursor="pointer"
              _hover={{ color: "grey" }}
            >
              <Image
                src={
                  activeTab == "quiz"
                    ? quizIconActive
                    : colorMode === "dark"
                    ? quizIconDark
                    : quizIcon
                }
                alt="quiz"
                objectFit="cover"
                width={50}
                height={50}
              />
              <Text
                textAlign="left"
                fontWeight={activeTab == "quiz" ? "bold" : "normal"}
              >
                Quiz
              </Text>
            </HStack>
          </NextLink>

          {isSubmitted && submissionId && (
            <NextLink
              href={`/courses/${router.query.id}/results?entry=${submissionId}`}
              passHref
            >
              <HStack
                alignItems="center"
                width="100%"
                gap={5}
                cursor="pointer"
                _hover={{ color: "grey" }}
                onClick={() => setActiveTab("results")}
              >
                <Image
                  src={
                    activeTab == "results"
                      ? walletIconActive
                      : colorMode === "dark"
                      ? walletIconDark
                      : walletIcon
                  }
                  alt="results"
                  objectFit="cover"
                  width={50}
                  height={50}
                />
                <Text
                  textAlign="left"
                  fontWeight={activeTab == "results" ? "bold" : "normal"}
                >
                  Results & Rewards
                </Text>
              </HStack>
            </NextLink>
          )}
        </VStack>
      ) : (
        <VStack mt={10} gap={5}>
          <NextLink href="/" passHref>
            <HStack
              alignItems="center"
              width="100%"
              gap={5}
              cursor="pointer"
              _hover={{ color: "grey" }}
            >
              <Image
                src={
                  activeTab == "home"
                    ? homeIconActive
                    : colorMode === "dark"
                    ? homeIconDark
                    : homeIcon
                }
                alt="home"
                objectFit="cover"
                width={50}
                height={50}
              />
              <Text
                textAlign="left"
                fontWeight={activeTab == "home" ? "bold" : "normal"}
              >
                Discover
              </Text>
            </HStack>
          </NextLink>
          {/* {user ? (
            <NextLink href="/rewards" passHref>
              <HStack
                alignItems="center"
                width="100%"
                gap={5}
                cursor="pointer"
                _hover={{ color: "grey" }}
              >
                <Image
                  src={
                    activeTab == "rewards"
                      ? walletIconActive
                      : colorMode === "dark"
                      ? walletIconDark
                      : walletIcon
                  }
                  alt="rewards"
                  objectFit="cover"
                  width={50}
                  height={50}
                />
                <Text
                  textAlign="left"
                  fontWeight={activeTab == "poaps" ? "bold" : "normal"}
                >
                  My Rewards
                </Text>
              </HStack>
            </NextLink>
          ) : (
            ""
          )} */}
        </VStack>
      )}
    </Box>
    // <>
    //   <Box>
    //     <VStack gap={8}>
    //       <Link href="/">
    //         <HStack
    //           alignItems="center"
    //           width="100%"
    //           gap={5}
    //           cursor="pointer"
    //           _hover={{ color: "grey" }}
    //           onClick={() => setActiveTab("videos")}
    //         >
    //           <Image
    //             src={
    //               activeTab == "videos"
    //                 ? videoIconActive
    //                 : colorMode === "dark"
    //                 ? videoIconDark
    //                 : videoIcon
    //             }
    //             alt="videos"
    //             objectFit="cover"
    //             width={50}
    //             height={50}
    //           />
    //           <Text
    //             textAlign="left"
    //             fontWeight={activeTab == "videos" ? "bold" : "normal"}
    //           >
    //             Videos
    //           </Text>
    //         </HStack>
    //       </Link>
    //       {user ? (
    //         <>
    //           <Link href="/courses/FcJNeRkHph/questions">
    //             <HStack
    //               alignItems="center"
    //               width="100%"
    //               gap={5}
    //               cursor="pointer"
    //               _hover={{ color: "grey" }}
    //               onClick={() => setActiveTab("quiz")}
    //             >
    //               <Image
    //                 src={
    //                   activeTab == "quiz"
    //                     ? quizIconActive
    //                     : colorMode === "dark"
    //                     ? quizIconDark
    //                     : quizIcon
    //                 }
    //                 alt="quiz"
    //                 objectFit="cover"
    //                 width={50}
    //                 height={50}
    //               />
    //               <Text
    //                 textAlign="left"
    //                 fontWeight={activeTab == "quiz" ? "bold" : "normal"}
    //               >
    //                 Quiz
    //               </Text>
    //             </HStack>
    //           </Link>
    // <Link href="/?tab=result">
    //   <HStack
    //     alignItems="center"
    //     width="100%"
    //     gap={5}
    //     cursor="pointer"
    //     _hover={{ color: "grey" }}
    //     onClick={() => setActiveTab("rewards")}
    //   >
    //     <Image
    //       src={
    //         activeTab == "rewards"
    //           ? walletIconActive
    //           : colorMode === "dark"
    //           ? walletIconDark
    //           : walletIcon
    //       }
    //       alt="rewards"
    //       objectFit="cover"
    //       width={50}
    //       height={50}
    //     />
    //     <Text
    //       textAlign="left"
    //       fontWeight={activeTab == "rewards" ? "bold" : "normal"}
    //     >
    //       Results & Rewards
    //     </Text>
    //   </HStack>
    // </Link>
    //         </>
    //       ) : (
    //         <></>
    //       )}
    //     </VStack>
    //   </Box>
    // </>
  );
}
