import { AspectRatio, HStack, VStack, Text, Box } from "@chakra-ui/react";
import NextLink from "next/link";
import { useMoralis } from "react-moralis";
import homeIcon from "../../public/icons/home-icon.svg";
import homeIconActive from "../../public/icons/home-icon-active.svg";
import walletIcon from "../../public/icons/wallet-icon.svg";
import walletIconActive from "../../public/icons/wallet-icon-active.svg";
import resourceIcon from "../../public/icons/resource-icon.svg";
// import resourceIconActive from "../../public/icons/resource-icon-active.svg";
import quizIcon from "../../public/icons/quiz-icon.svg";
import quizIconActive from "../../public/icons/quiz-icon-active.svg";
import videoIcon from "../../public/icons/video-icon.svg";
import videoIconActive from "../../public/icons/video-icon-active.svg";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SideNav(props) {
  const [courseNav, setCourseNav] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const { user } = useMoralis();
  const router = useRouter();

  useEffect(() => {
    if (router.pathname.includes('courses')) {
      if (router.pathname.includes('questions')) {
        setActiveTab("quiz")
        return setCourseNav(true)
      }
      if (router.pathname.includes('resources')) {
        setActiveTab("resources")
        return setCourseNav(true)
      }
      setActiveTab("video")
      return setCourseNav(true)
    }
    if (router.pathname.includes("poaps")) {
      setActiveTab("poaps")
      return setCourseNav(false)
    }
    setActiveTab("home")
    return setCourseNav(false)
  }, [])

  return (
    <Box>
      {courseNav ?
        <VStack mt={10} gap={5}>
          <NextLink href="/" passHref>
            <HStack alignItems="center" width="100%" gap={5} cursor="pointer" _hover={{ color: 'grey' }}>
              <Image src={activeTab == "home" ? homeIconActive : homeIcon} alt="home" objectFit="cover" width={50} height={50} />
              <Text textAlign="center" fontWeight={activeTab == "home" ? "bold" : "normal"}>
                Discover
              </Text>
            </HStack>
          </NextLink>
          <NextLink href={`/courses/${router.query.id}/`} passHref>
            <HStack alignItems="center" width="100%" gap={5} cursor="pointer" _hover={{ color: 'grey' }}>
              <Image src={activeTab == "video" ? videoIconActive : videoIcon} alt="video" objectFit="cover" width={50} height={50} />
              <Text textAlign="center" fontWeight={activeTab == "video" ? "bold" : "normal"}>
                Video
              </Text>
            </HStack>
          </NextLink>
          <NextLink href={`/courses/${router.query.id}/resources`} passHref>
            <HStack alignItems="center" width="100%" gap={5} cursor="pointer" _hover={{ color: 'grey' }}>
              <Image src={activeTab == "resources" ? resourceIcon : resourceIcon} alt="extra resources" objectFit="cover" width={50} height={50} />
              <Text textAlign="center" fontWeight={activeTab == "resources" ? "bold" : "normal"}>
                Extra Resources
              </Text>
            </HStack>
          </NextLink>
          <NextLink href={`/courses/${router.query.id}/questions`} passHref>
            <HStack alignItems="center" width="100%" gap={5} cursor="pointer" _hover={{ color: 'grey' }}>
              <Image src={activeTab == "quiz" ? quizIconActive : quizIcon} alt="quiz" objectFit="cover" width={50} height={50} />
              <Text textAlign="center" fontWeight={activeTab == "quiz" ? "bold" : "normal"}>
                Quiz
              </Text>
            </HStack>
          </NextLink>
          {/* {user ?
            <NextLink href="/profile" passHref>
              <HStack alignItems="center" width="100%" gap={5} cursor="pointer">
                <Image src={activeTab == "profile" ? walletIconActive : walletIcon} alt="poaps" objectFit="cover" width={50} height={50} />
                <Text textAlign="center" fontWeight={activeTab == "profile" ? "bold" : "normal"}>
                  My POAPS
                </Text>
              </HStack>
            </NextLink>
            : ""
          } */}
        </VStack>
        :
        <VStack mt={10} gap={5}>
          <NextLink href="/" passHref>
            <HStack alignItems="center" width="100%" gap={5} cursor="pointer" _hover={{ color: 'grey' }}>
              <Image src={activeTab == "home" ? homeIconActive : homeIcon} alt="home" objectFit="cover" width={50} height={50} />
              <Text textAlign="center" fontWeight={activeTab == "home" ? "bold" : "normal"}>
                Discover
              </Text>
            </HStack>
          </NextLink>
          {user ?
            <NextLink href="/poaps" passHref>
              <HStack alignItems="center" width="100%" gap={5} cursor="pointer" _hover={{ color: 'grey' }}>
                <Image src={activeTab == "poaps" ? walletIconActive : walletIcon} alt="poaps" objectFit="cover" width={50} height={50} />
                <Text textAlign="center" fontWeight={activeTab == "poaps" ? "bold" : "normal"}>
                  My POAPS
                </Text>
              </HStack>
            </NextLink>
            : ""
          }
        </VStack>
      }
    </Box>
  )
}