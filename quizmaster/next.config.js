module.exports = {
  reactStrictMode: true,
  env: {
    MoralisServerURL: process.env.MORALIS_SERVER_URL,
    MoralisAppID: process.env.MORALIS_APP_ID,
    AlchemyKey: process.env.ALCHEMY_PROD_KEY,
    AlchemyUrl: process.env.ALCHEMY_PROD_URL,
    AlchemyKey_Dev: process.env.ALCHEMY_DEV_KEY,
    AlchemyUrl_Dev: process.env.ALCHEMY_DEV_URL
  },
  images: {
    domains: ["img.youtube.com"]
  }
}
