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
  FormLabel
} from '@chakra-ui/react';
import Image from 'next/image';
import { useRef, useContext } from 'react';
import { useMoralis } from 'react-moralis';
import { AdminContext } from '../../context/AdminContext';
import logo from '../../public/ECHLogo.png';

export default function NavBar(props) {
  const { authenticate, isAuthenticating, logout, isLoggingOut } = useMoralis();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const { devMode, setDevMode } = useContext(AdminContext)
  
  return (
    <HStack justify={'space-between'} align={'center'} borderBottom={'1px solid grey'} padding={5}>
      <AspectRatio maxWidth={50} maxHeight={55} ratio={-1}>
        <Image src={logo} />
      </AspectRatio>
      {props.authenticated ? 
        <HStack>
          <FormControl display='flex' alignItems='center'>
            <FormLabel htmlFor='chain-toggler' mb={0}>
              Enable Dev Mode?
            </FormLabel>
            <Switch id='chain-toggler' defaultChecked={devMode} value={devMode} onChange={(e) => setDevMode(e.target.checked !== undefined && e.target.checked)} />
          </FormControl>
          <Text color={'white'} bg={'rgba(35, 35, 35, 1)'} borderRadius={5} padding={2}>
            {`${props.ethAddress.substring(0, 9)}...`}
          </Text>
          <Button
            onClick={logout}
            isLoading={isLoggingOut}
            color='white'
            backgroundColor='black'
          >
            Logout
          </Button>
        </HStack>
        :
        <Button
          ref={btnRef}
          onClick={onOpen}
          color='white'
          backgroundColor='black'
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
                color='white'
                backgroundColor='black'
              >
                MetaMask
              </Button>
              <Button
                width={'100%'}
                onClick={() => authenticate({
                  provider: 'walletconnect'
                }).then(() => onClose())}
                isLoading={isAuthenticating}
                color='white'
                backgroundColor='black'
              >
                Wallet Connect
              </Button>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose} color='white' backgroundColor='black'>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </HStack>
  )
}