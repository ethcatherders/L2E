import { 
  HStack,
  // VStack, 
  // Text, 
  AspectRatio, 
  // Button,
  // Box,
  // Drawer,
  // DrawerBody,
  // DrawerFooter,
  // DrawerHeader,
  // DrawerOverlay,
  // DrawerContent,
  // DrawerCloseButton,
  // useDisclosure
} from '@chakra-ui/react';
import Image from 'next/image';
// import { useRef } from 'react';
// import { useMoralis } from 'react-moralis';
import logo from '../../public/ECHLogo.png';
import Link from 'next/link';

export default function NavBar(props) {
  // const { authenticate, isAuthenticating, logout, isLoggingOut } = useMoralis();
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const btnRef = useRef();

  return (
    <HStack justify={'space-between'} align={'center'} borderBottom={'1px solid grey'} padding={5}>
      <Link href='/'>
        <AspectRatio maxWidth={50} maxHeight={55} ratio={-1} cursor='pointer'>
          <Image src={logo} />
        </AspectRatio>
      </Link>
      {/* {props.authenticated ? 
        <HStack>
          <Text color={'white'} bg={'rgba(35, 35, 35, 1)'} borderRadius={5} padding={2}>
            {`${props.ethAddress.substring(0, 9)}...`}
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
      </Drawer> */}
    </HStack>
  )
}