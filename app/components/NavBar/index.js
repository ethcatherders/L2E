import { 
  HStack,
  VStack, 
  Text, 
  AspectRatio, 
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import Image from 'next/image';
import { useRef } from 'react';
import { useMoralis } from 'react-moralis';
import logo from '../../public/vercel.svg';

export default function NavBar(props) {
  const { authenticate, isAuthenticating } = useMoralis();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  return (
    <HStack justify={'space-between'} align={'center'} borderBottom={'1px solid grey'} padding={5}>
      <AspectRatio maxWidth={'75px'}>
        <Image src={logo} />
      </AspectRatio>
      {props.authenticated ? 
        <Text>
          {props.ethAddress}
        </Text>
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
                })}
                isLoading={isAuthenticating}
              >
                MetaMask
              </Button>
              <Button
                width={'100%'}
                onClick={() => authenticate({
                  provider: 'walletconnect'
                })}
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
    </HStack>
  )
}