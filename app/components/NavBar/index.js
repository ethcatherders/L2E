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
  IconButton
} from '@chakra-ui/react';
import { useContext, useRef } from 'react';
import { useMoralis } from 'react-moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { Web3Context } from '../../context/Web3Context';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';


export default function NavBar(props) {
  const { devMode, setDevMode } = useContext(Web3Context)
  const { authenticate, isAuthenticating, logout, isLoggingOut, isAuthenticated, user } = useMoralis();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box>
      <HStack justifyContent="flex-end" alignItems='center' padding={5}>
        <IconButton
          icon={colorMode === 'dark' ? <MoonIcon/> : <SunIcon/>}
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
                <FormControl display='flex' alignItems='center' justifyContent='space-between' padding={3}>
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
                  provider: 'metamask'
                }).then(() => onClose())}
                isLoading={isAuthenticating}
              >
                MetaMask
              </Button>
              <Button
                width={'100%'}
                onClick={() => authenticate({
                  provider: 'walletconnect'
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