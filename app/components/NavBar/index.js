import { 
  HStack,
  VStack, 
  Text,
  Avatar,
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
  Tooltip
} from '@chakra-ui/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Web3Context } from '../../context/Web3Context';
import { MoonIcon, SunIcon } from '../Icons';


export default function NavBar(props) {
  const [wrongNetworkMsg, setWrongNetworkMsg] = useState(false)
  const { devMode, setDevMode } = useContext(Web3Context)
  const { authenticate, isAuthenticating, logout, Moralis, isAuthenticated, user, isInitialized, chainId } = useMoralis();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const { colorMode, toggleColorMode } = useColorMode();
  const authMessage = "By signing this message, you are verifying that you own this wallet address and will use it as your account to interact with the ECH Learn2Earn website."

  useEffect(() => {
    if (user && isAuthenticated) {
      getNetwork()
    }
  }, [isInitialized, user, isAuthenticated, chainId, devMode])

  async function getNetwork() {
    if (!Moralis.isWeb3Enabled()) await Moralis.enableWeb3();
    const connectorType = Moralis.connectorType;
    if (connectorType === "injected") {
      if (!devMode && chainId && chainId !== "0x89") {
        setWrongNetworkMsg(true)
      } else if (devMode && chainId && chainId !== "0x13881") {
        setWrongNetworkMsg(true)
      } else {
        setWrongNetworkMsg(false)
      }
    }
  }

  async function isValidNetwork(connectorType, chainId, devMode) {
    if (connectorType === "injected") {
      if ((!devMode && chainId !== "0x89") || (devMode && chainId !== "0x13881")) {
        return true
      }
      return false
    }
  }

  async function switchNetwork() {
    if (devMode) {
      await Moralis.switchNetwork("0x13881")
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
      await Moralis.switchNetwork("0x89")
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

  return (
    <Box>
      <HStack justifyContent="flex-end" alignItems='center' padding={5}>
        {wrongNetworkMsg && (
          <Tooltip label={`Switch to ${devMode ? 'Mumbai Testnet' : 'Polygon Mainnet'}`} aria-label='A tooltip'>
            <Tag
              colorScheme='red'
              borderRadius='full'
              padding={2}
              cursor='pointer'
              onClick={switchNetwork}
            >
              <TagLabel>Switch to {devMode ? 'Mumbai' : 'Polygon'}</TagLabel>
            </Tag>
          </Tooltip>
        )}
        <IconButton
          icon={colorMode === 'dark' ? <MoonIcon /> : <SunIcon/>}
          color='white'
          bg='rgba(35, 35, 35, 1)'
          onClick={toggleColorMode}
        />
        {user && isAuthenticated ? 
          <HStack>
            <Text color={'white'} bg={'rgba(35, 35, 35, 1)'} borderRadius={5} padding={2}>
              {`${user.attributes.ethAddress.substring(0, 9)}...`}
            </Text>
            <Menu>
              <MenuButton padding={1} as={Circle} _hover={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} cursor='pointer'>
                <Avatar />
              </MenuButton>
              <MenuList>
                <FormControl display='flex' alignItems='center' justifyContent='space-between' padding={3} isDisabled={true}>
                  <FormLabel htmlFor='devmode-toggler' mb={0}>
                    Use Testnet?
                  </FormLabel>
                  <Switch
                    id='devmode-toggler'
                    defaultChecked={devMode}
                    onChange={(e) => setDevMode(e.target.checked !== undefined && e.target.checked)}
                  />
                </FormControl>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
          :
          <Button
            ref={btnRef}
            onClick={onOpen}
          >
            Connect Wallet
          </Button>
        }
      </HStack>
      <Drawer
        isOpen={isOpen}
        placement='right'
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
              <Button
                width={'100%'}
                onClick={() => authenticate({
                  provider: 'metamask',
                  signingMessage: authMessage
                }).then(() => onClose())}
                isLoading={isAuthenticating}
              >
                MetaMask
              </Button>
              <Button
                width={'100%'}
                onClick={() => authenticate({
                  provider: 'walletconnect',
                  signingMessage: authMessage
                }).then(() => onClose())}
                isLoading={isAuthenticating}
              >
                Wallet Connect
              </Button>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}