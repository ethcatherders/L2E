import { AspectRatio, HStack, VStack, Text, Box } from "@chakra-ui/react";
import NextLink from "next/link";
import { useMoralis } from "react-moralis";
import homeIcon from "../../public/icons/home-icon.svg";
import homeIconActive from "../../public/icons/home-icon-active.svg";
import walletIcon from "../../public/icons/wallet-icon.svg";
import walletIconActive from "../../public/icons/wallet-icon-active.svg";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SideNav(props) {
  const [activeTab, setActiveTab] = useState("home")
  const { user } = useMoralis();
  const router = useRouter();

  useEffect(() => {
    if (router.pathname.includes("poaps")) {
      return setActiveTab("poaps")
    }
    if (router.pathname.includes("admins")) {
      return setActiveTab("admins")
    }
    setActiveTab("home")
  }, [])

  return (
    <Box>
      <VStack mt={10} gap={5}>
        <NextLink href="/" passHref>
          <HStack alignItems="center" width="100%" gap={5} cursor="pointer" _hover={{ color: 'grey' }}>
            <Image src={activeTab == "home" ? homeIconActive : homeIcon} alt="home" objectFit="cover" width={50} height={50} />
            <Text textAlign="center" fontWeight={activeTab == "home" ? "bold" : "normal"}>
              Courses
            </Text>
          </HStack>
        </NextLink>
        <NextLink href="/poaps" passHref>
          <HStack alignItems="center" width="100%" gap={5} cursor="pointer" _hover={{ color: 'grey' }}>
            <Image src={activeTab == "poaps" ? walletIconActive : walletIcon} alt="poaps" objectFit="cover" width={50} height={50} />
            <Text textAlign="center" fontWeight={activeTab == "poaps" ? "bold" : "normal"}>
              POAPS
            </Text>
          </HStack>
        </NextLink>
        <NextLink href="/admins" passHref>
          <HStack alignItems="center" width="100%" gap={5} cursor="pointer" _hover={{ color: 'grey' }}>
            <Image src={activeTab == "admins" ? walletIconActive : walletIcon} alt="admins" objectFit="cover" width={50} height={50} />
            <Text textAlign="center" fontWeight={activeTab == "admins" ? "bold" : "normal"}>
              Admins
            </Text>
          </HStack>
        </NextLink>
      </VStack>
    </Box>
  )
}