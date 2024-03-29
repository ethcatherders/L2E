import {
  HStack,
  VStack,
  Text,
  Avatar,
  AvatarBadge,
  Button,
  Box,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Circle,
  IconButton,
  Tag,
  TagLabel,
  Tooltip,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import { useMoralis } from "react-moralis";
import { Web3Context } from "../../context/Web3Context";
import { MenuIcon, MoonIcon, SunIcon } from "../Icons";
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
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useEnsName, useEnsAvatar } from "wagmi";
import { polygon, polygonMumbai } from "wagmi/chains";
import { createSiweMessage } from "../../utils/siwe";

export default function NavBar(props) {
  const { isMobile } = props;
  const connectModal = useConnectModal();
  const { openConnectModal, connectModalOpen } = connectModal;
  const [fullSignin, setFullSignin] = useState(false);
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address: account?.address,
    chainId: 1,
  });
  const { data: ensAvatar, isLoading: isEnsAvatarLoading } = useEnsAvatar({
    name: ensName,
  });
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wrongNetworkMsg, setWrongNetworkMsg] = useState(false);
  const { devMode, setDevMode } = useContext(Web3Context);
  const {
    authenticate,
    isAuthenticating,
    logout,
    Moralis,
    isAuthenticated,
    user,
    isInitialized,
    chainId,
  } = useMoralis();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const btnRef2 = useRef();
  const { colorMode, toggleColorMode } = useColorMode();
  const authMessage =
    "By signing this message, you are verifying that you own this wallet address and will use it as your account to interact with the ECH Learn2Earn website.";

  useEffect(() => {
    if (user && isAuthenticated) {
      getNetwork();
    }
  }, [isInitialized, user, isAuthenticated, chainId, devMode]);

  useEffect(() => {
    if (
      fullSignin &&
      account &&
      account.address &&
      !connectModalOpen &&
      !isAuthenticating &&
      !isAuthenticated
    ) {
      signin()
        .then(() => setFullSignin(false))
        .catch((e) => {
          console.error(e);
          setFullSignin(false);
        });
    }
  }, [fullSignin, account]);

  async function signin() {
    // disconnect()
    const { message } = await Moralis.Cloud.run("requestMessage", {
      address: account.address,
      chain: polygonMumbai.id,
      networkType: "evm",
    });
    console.log("connector: ", account?.connector.name.toLowerCase());
    if (account?.connector.name.toLowerCase() == "walletconnect") {
      return await authenticate({
        provider: "walletconnect",
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
        signingMessage: message,
      });
    } else {
      return await authenticate({
        provider: "metamask",
        signingMessage: message,
      });
    }
  }

  async function getNetwork() {
    if (!Moralis.isWeb3Enabled()) await Moralis.enableWeb3();
    const connectorType = Moralis.connectorType;
    if (connectorType === "injected") {
      if (!devMode && chainId && chainId !== "0x89") {
        setWrongNetworkMsg(true);
      } else if (devMode && chainId && chainId !== "0x13881") {
        setWrongNetworkMsg(true);
      } else {
        setWrongNetworkMsg(false);
      }
    }
  }

  async function isValidNetwork(connectorType, chainId, devMode) {
    if (connectorType === "injected") {
      if (
        (!devMode && chainId !== "0x89") ||
        (devMode && chainId !== "0x13881")
      ) {
        return true;
      }
      return false;
    }
  }

  async function switchNetwork() {
    if (devMode) {
      await Moralis.switchNetwork("0x13881");
      if (chainId === "0x13881") {
        const chainId = 80001;
        const chainName = "Mumbai Testnet";
        const currencyName = "MATIC";
        const currencySymbol = "MATIC";
        const rpcUrl = "https://rpc-mumbai.maticvigil.com/";
        const blockExplorerUrl = "https://mumbai.polygonscan.com/";

        await Moralis.addNetwork(
          chainId,
          chainName,
          currencyName,
          currencySymbol,
          rpcUrl,
          blockExplorerUrl
        );
      }
    } else {
      await Moralis.switchNetwork("0x89");
      if (chainId === "0x89") {
        const chainId = 137;
        const chainName = "Polygon Mainnet";
        const currencyName = "MATIC";
        const currencySymbol = "MATIC";
        const rpcUrl = "https://polygon-rpc.com";
        const blockExplorerUrl = "https://polygonscan.com/";

        await Moralis.addNetwork(
          chainId,
          chainName,
          currencyName,
          currencySymbol,
          rpcUrl,
          blockExplorerUrl
        );
      }
    }
  }

  const [courseNav, setCourseNav] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const router = useRouter();
  let tab;
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    tab = urlParams.get("tab");
  }
  const { id } = router.query;
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
      <Drawer
        isOpen={isMobileMenuOpen}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        finalFocusRef={btnRef2}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>

          <DrawerBody>
            {/* {courseNav ? (
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
                      Video
                    </Text>
                  </HStack>
                </NextLink>
                <NextLink
                  href={`/courses/${router.query.id}/resources`}
                  passHref
                >
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
                <NextLink
                  href={`/courses/${router.query.id}/questions`}
                  passHref
                >
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
                {user ? (
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
                )}
              </VStack>
            )} */}
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

                {user ? (
                  <>
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
                    <NextLink href={`/courses/${id}/resources`} passHref>
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
                          fontWeight={
                            activeTab == "resources" ? "bold" : "normal"
                          }
                        >
                          Extra Resources
                        </Text>
                      </HStack>
                    </NextLink>
                    <NextLink href={`/courses/${id}/questions`} passHref>
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
                        href={`/courses/${id}/results?entry=${submissionId}`}
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
                            fontWeight={
                              activeTab == "results" ? "bold" : "normal"
                            }
                          >
                            Results & Rewards
                          </Text>
                        </HStack>
                      </NextLink>
                    )}
                  </>
                ) : (
                  <></>
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
              </VStack>
            )}
          </DrawerBody>

          <DrawerFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => setMobileMenuOpen(false)}
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <HStack
        justify={isMobile ? "space-between" : "flex-end"}
        align="center"
        padding={5}
      >
        {isMobile && (
          <IconButton
            icon={<MenuIcon />}
            ref={btnRef2}
            onClick={() => setMobileMenuOpen(true)}
            color="white"
            backgroundColor="rgba(35, 35, 35, 1)"
            _hover={{ backgroundColor: "rgba(35, 35, 35, 0.5)" }}
          >
            Menu
          </IconButton>
        )}
        <HStack justifyContent="flex-end" alignItems="center">
          {/* {wrongNetworkMsg && (
            <Tooltip
              label={`Switch to ${
                devMode ? "Mumbai Testnet" : "Polygon Mainnet"
              }`}
              aria-label="A tooltip"
            >
              <Tag
                colorScheme="red"
                borderRadius="full"
                padding={2}
                cursor="pointer"
                onClick={switchNetwork}
              >
                <TagLabel>Switch to {devMode ? "Mumbai" : "Polygon"}</TagLabel>
              </Tag>
            </Tooltip>
          )} */}
          <IconButton
            icon={colorMode === "dark" ? <MoonIcon /> : <SunIcon />}
            color="white"
            backgroundColor="rgba(35, 35, 35, 1)"
            _hover={{ backgroundColor: "rgba(35, 35, 35, 0.5)" }}
            onClick={toggleColorMode}
          />
          {
            user && isAuthenticated ? (
              <HStack>
                <Text
                  color={"white"}
                  bg={"rgba(35, 35, 35, 1)"}
                  borderRadius={5}
                  padding={2}
                >
                  {ensName ??
                    `${user.attributes.ethAddress.substring(
                      0,
                      5
                    )}...${user.attributes.ethAddress.substring(
                      user.attributes.ethAddress.length - 4
                    )}`}
                </Text>
                <Menu>
                  <MenuButton
                    padding={1}
                    as={Circle}
                    _hover={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    cursor="pointer"
                  >
                    <Avatar src={ensAvatar}>
                      {/* {!!wrongNetworkMsg ? <AvatarBadge colorScheme="red" bg="red.500" color="red" size="5rem" /> : ""} */}
                    </Avatar>
                  </MenuButton>
                  <MenuList>
                    {/* <FormControl
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      padding={3}
                    >
                      <FormLabel htmlFor="devmode-toggler" mb={0}>
                        Use Testnet?
                      </FormLabel>
                      <Switch
                        id="devmode-toggler"
                        defaultChecked={devMode}
                        onChange={(e) =>
                          setDevMode(
                            e.target.checked !== undefined && e.target.checked
                          )
                        }
                      />
                    </FormControl> */}
                    {wrongNetworkMsg && (
                      <MenuItem
                        // label={`Switch to ${
                        //   devMode ? "Mumbai Testnet" : "Polygon Mainnet"
                        // }`}
                        // aria-label="A tooltip"
                        onClick={switchNetwork}
                      >
                        <Tag
                          colorScheme="red"
                          borderRadius="full"
                          padding={2}
                          cursor="pointer"
                          // onClick={switchNetwork}
                        >
                          <TagLabel>Switch to {devMode ? "Mumbai" : "Polygon"}</TagLabel>
                        </Tag>
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => logout().then(() => disconnect())}>
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            ) : (
              <Button
                ref={btnRef}
                // onClick={onOpen}
                onClick={async () => {
                  try {
                    if (account.address) return signin();
                    openConnectModal();
                    setFullSignin(true);
                  } catch (error) {
                    console.log(error);
                  }
                }}
                isLoading={isAuthenticating}
              >
                Connect Wallet
              </Button>
            )
            // <ConnectButton />
          }
        </HStack>
      </HStack>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Sign Up / Sign In</DrawerHeader>

          <DrawerBody>
            <VStack>
              <Text>Connect your wallet via the following options:</Text>
              <Button width={"100%"} onClick={openConnectModal}>
                RainbowKit
              </Button>
              <Button
                width={"100%"}
                onClick={() =>
                  authenticate({
                    provider: "metamask",
                    signingMessage: authMessage,
                  }).then(() => onClose())
                }
                isLoading={isAuthenticating}
              >
                MetaMask
              </Button>
              <Button
                width={"100%"}
                onClick={() =>
                  authenticate({
                    provider: "walletconnect",
                    signingMessage: authMessage,
                  }).then(() => onClose())
                }
                isLoading={isAuthenticating}
              >
                Wallet Connect
              </Button>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
