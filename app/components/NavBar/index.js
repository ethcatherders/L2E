import { 
  HStack,
  VStack, 
  Text, 
  AspectRatio, 
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
  useColorModeValue
} from '@chakra-ui/react';
import Image from 'next/image';
import { useRef } from 'react';
import { useMoralis } from 'react-moralis';
import logo from '../../public/ECHLogo.png';
import Link from 'next/link';


export default function NavBar(props) {
  const { authenticate, isAuthenticating, logout, isLoggingOut, isAuthenticated, user } = useMoralis();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  return (
    <Box>

      <HStack justifyContent="flex-end" alignItems='center' padding={5}>
        {/* <Link href='/'>
          <AspectRatio maxWidth={50} maxHeight={55} ratio={-1} cursor='pointer'>
            <Image src={logo} />
          </AspectRatio>
        </Link> */}
        <FormControl width="fit-content" paddingRight={5}>
          <HStack>
            <FormLabel htmlFor='colormode-toggle' mb={0}>
              {useColorModeValue('Light', 'Dark')}
            </FormLabel>
            <Switch id="colormode" isChecked={useColorModeValue(false, true)} />
          </HStack>
        </FormControl>
        {user && isAuthenticated ? 
          <HStack>
            <Text color={'white'} bg={'rgba(35, 35, 35, 1)'} borderRadius={5} padding={2}>
              {`${user.attributes.ethAddress.substring(0, 9)}...`}
            </Text>
            <Button
              onClick={logout}
              isLoading={isLoggingOut}
            >
              Logout
            </Button>
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