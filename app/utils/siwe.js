import { SiweMessage } from 'siwe';

export function createSiweMessage (
  domain,
  origin,
  address,
  statement,
  chainId
) {
  const expirationTimeUnix = Date.now() + 1000 * 60 * 60 * 24 * 30
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId,
    expirationTime: new Date(expirationTimeUnix).toISOString(),
    notBefore: new Date(expirationTimeUnix - 1000 * 60 * 15).toISOString()
  });
  return message.prepareMessage();
}

export async function signInWithEthereum (
  domain,
  origin,
  chainId,
  account,
  signer
) {
  const message = createSiweMessage(
    domain,
    origin,
    account,
    'Sign in with Ethereum to the app.',
    chainId
  );
  const signature = await signer.signMessage(message)
  return { signature, message }
}